import { Component } from "./components/base/Component.js";
import { AnyFn, MaybePromise, ObjectOf, ObjectOrArrayOf, TimeMeasure } from "./shared/types.js";
import { Connectable } from "./shared/base/Connectable.js";
import { defineTimeRamp, isFunction, isType, loadFile, zip } from "./shared/util.js";
import { AudioRecordingComponent } from "./components/AudioRecordingComponent.js";
import { BufferWriterComponent } from "./components/BufferWriterComponent.js";
import { StreamSpec } from "./shared/StreamSpec.js";
import { joinContexts } from "./shared/multicontext.js";
import { AudioConfig } from "./shared/config.js";
import { BufferComponent } from "./components/BufferComponent.js";
import { BaseConnectable } from "./shared/base/BaseConnectable.js";
import { AudioRateInput } from "./io/input/AudioRateInput.js";
// @ts-ignore Missing d.ts
import stache from 'stache-config';
import * as internalNamespace from './internals.js'
import publicNamespace from './public.js'
import * as init from './shared/init.js'

const baseWithConfig = stache.registerAndCreateFactoryFn(
  init.defaultConfig,
  publicNamespace,
  { ...internalNamespace }
)

class GestureListener {
  private static USER_GESTURES = ["change", "click", "contextmenu", "dblclick", "mouseup", "pointerup", "reset", "submit", "touchend"] as const
  userHasInteracted = false
  gestureListeners: Function[] = []

  constructor() {
    for (const gesture of GestureListener.USER_GESTURES) {
      document.addEventListener(gesture, () => {
        this.userHasInteracted = true
        this.gestureListeners.forEach(f => f())
      }, { once: true })
    }
  }
  waitForUserGesture(): Promise<void> {
    if (this.userHasInteracted) {
      return Promise.resolve()
    } else {
      return new Promise(res => { this.gestureListeners.push(res) })
    }
  }
}

const GESTURE_LISTENER = new GestureListener()

export class IATopLevel {
  out: AudioRateInput
  util: typeof internalNamespace.util
  constructor(
    public config: AudioConfig,
    public internals: typeof internalNamespace
  ) {
    this.out = new this.internals.AudioRateInput('out', undefined, config.audioContext.destination)
    this.util = internalNamespace.util
  }
  get audioContext() {
    return this.config.audioContext
  }
  private listeners: ((ctx?: AudioContext) => any)[] = []
  private initStarted: boolean = false
  private createInitListeners() {
    Promise.all([
      this.audioContext.audioWorklet.addModule(this.config.workletPath), GESTURE_LISTENER.waitForUserGesture()
    ]).then(() => {
      this.onSuccessfulInit(true)
    }, () => {
      this.onSuccessfulInit(false)
    })
  }
  isInitialized: boolean = false
  private onSuccessfulInit(workletAvailable: boolean) {
    if (this.isInitialized) return
    this.isInitialized = true

    this.config.state.workletIsAvailable = workletAvailable
    workletAvailable || console.warn(`Unable to load worklet file from ${this.config.workletPath}. Worklet-based processing will be disabled. Verify the workletPath configuration setting is set correctly and the file is available.`)

    this.config.audioContext.resume()
    for (const listener of this.listeners) {
      listener(this.config.audioContext)
    }
  }

  /**
   * Register a function to be called once the audio engine is ready and a user gesture has been performed.
   * 
   * @param callback A function to run once the audio engine is ready.
   */
  async run<T>(callback: (ctx?: AudioContext) => T): Promise<T> {
    await this.init();
    return callback(this.audioContext);
  }
  init(): Promise<boolean> {
    let resolve: Function;
    let p = new Promise<boolean>(res => resolve = res)
    if (!this.initStarted) this.createInitListeners()
    this.initStarted = true

    if (this.isInitialized) {
      return Promise.resolve(true)
    } else {
      this.listeners.push(() => {
        resolve(true)
      })
    }
    return p
  }

  withConfig(
    customConfigOptions: Partial<AudioConfig> = {},
    configId?: string
  ) {
    customConfigOptions.logger ??= new this.internals.SignalLogger()
    customConfigOptions.state = {
      workletIsAvailable: false,
      components: {}
    }
    const config = { ...this.config, ...customConfigOptions }
    const namespace: typeof this.internals = baseWithConfig(config, configId)
    return new IATopLevel(config, namespace)
  }

  disconnectAll() {
    for (const componentRef of Object.values(this.config.state.components)) {
      componentRef.deref()?.disconnect()
    }
    this.config.state.components = {}
  }

  stackChannels(inputs: Connectable[]) {
    return this.internals.ChannelStacker.fromInputs(inputs)
  }

  // TODO: implement a method constant(val) that defines a constant signal.
  generate(
    fn: (t: number) => number,
    timeMeasure: TimeMeasure = TimeMeasure.SECONDS
  ): internalNamespace.TimeVaryingSignal {
    if (isFunction(fn)) {
      return new this.internals.TimeVaryingSignal(fn, timeMeasure)
    } else {
      throw new Error("not supported yet.")
    }
  }

  combine(
    inputs: Connectable[] | ObjectOf<Connectable>,
    fn: Function, options = {}
  ): Component {
    const values: Connectable[] = inputs instanceof Array ? inputs : Object.values(inputs)
    // TODO: Also allow cases where the arguments aren't outputs, but values 
    // themselves.
    if (values.every(o => o.isControlStream)) {
      // Needs to learn to handle float input I think.
      return new this.internals.FunctionComponent(fn).withInputs(inputs)
    } else {
      return new this.internals.AudioTransformComponent(
        fn,
        { ...options, inputSpec: new StreamSpec({ numStreams: values.length }) }
      ).withInputs(...values)
    }
  }

  // TODO: make this work for inputs/outputs
  bundle(inputs: ObjectOrArrayOf<Component>) {
    return new this.internals.BundleComponent(inputs)
  }

  // TODO: Potentially turn this into a component (?).
  ramp(units: TimeMeasure): Connectable {
    return new this.internals.AudioRateOutput('time', defineTimeRamp(this.config.audioContext, units))
  }

  read(fname: string): Promise<AudioBuffer> {
    return loadFile(this.config.audioContext, fname)
  }

  func<T0, T1, T2, T3, T4, T5, R>(
    fn: AnyFn<T0, T1, T2, T3, T4, T5, R>
  ): internalNamespace.FunctionComponent<T0, T1, T2, T3, T4, T5, R> {
    return new this.internals.FunctionComponent(fn)
  }

  bufferReader(fname: string): BufferComponent
  bufferReader(buffer: MaybePromise<AudioBuffer>): BufferComponent
  bufferReader(arg: string | MaybePromise<AudioBuffer>): BufferComponent {
    const bufferComponent = new this.internals.BufferComponent()
    const buffer = isType(arg, String) ? this.read(arg) : arg
    bufferComponent.buffer.setValue(buffer)
    return bufferComponent
  }

  bufferWriter(buffer: AudioBuffer): BufferWriterComponent {
    return new this.internals.BufferWriterComponent(buffer)
  }

  // TODO: handle more input types.
  recorder(sources: Connectable[]): AudioRecordingComponent
  recorder(sourceAudio: Connectable): AudioRecordingComponent
  recorder(sources: any): AudioRecordingComponent {
    sources = sources instanceof Array ? sources : [sources]
    const component = new this.internals.AudioRecordingComponent(sources.length)
    sources.map((s: Component, i: number) => s.connect(component.inputs[i]))
    return component
  }

  /**
   * Allow joining ("mixing") across multiple audioContexts / threads.
   */
  join(sources: BaseConnectable[]) {
    const sourceContexts = [...new Set(sources.map(s => s.audioContext))]
    const { sinks, source } = joinContexts(sourceContexts, this.config.audioContext)
    const sinkMap = new Map(zip(sourceContexts, sinks))
    for (const sourceConnectable of sources) {
      const sink = sinkMap.get(sourceConnectable.audioContext)
      if (sink == undefined) {
        throw new Error(`Unable to find audioContext of ${sourceConnectable}.`)
      }
      sourceConnectable.connect(sink)
    }
    return new this.internals.AudioComponent(source)
  }
  async createThread({
    name,
    audioContext,
    ...options
  }: Partial<AudioConfig> & { name?: string } = {}
  ): Promise<IATopLevel> {
    const obj = this.withConfig({
      audioContext: audioContext ?? new AudioContext(),
      ...options
    }, name)

    let resolve: Function
    let p = new Promise((res, rej) => {
      resolve = res
    })
    obj.run(() => { resolve(obj) })
    return p as any
  }
}