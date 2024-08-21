import { Component } from "./components/base/Component.js";
import { MaybePromise, ObjectOf, ObjectOrArrayOf, TimeMeasure } from "./shared/types.js";
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
const USER_GESTURES = ["change", "click", "contextmenu", "dblclick", "mouseup", "pointerup", "reset", "submit", "touchend"]
let userHasInteracted = false

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
  private gestureListeners: ((ctx?: AudioContext) => any)[] = []
  private runCalled: boolean = false
  private createInitListeners() {
    const workletPromise = this.audioContext.audioWorklet.addModule(this.config.workletPath)
    const initAfterAsync = () => {
      userHasInteracted = true
      workletPromise.then(() => this.init(true), () => this.init(false))
    }
    if (userHasInteracted) {
      initAfterAsync()
    } else {
      for (const gesture of USER_GESTURES) {
        document.addEventListener(gesture, initAfterAsync, { once: true })
      }
    }
  }
  isInitialized: boolean = false
  private init(workletAvailable: boolean) {
    if (this.isInitialized) return
    this.isInitialized = true

    this.config.state.workletIsAvailable = workletAvailable
    workletAvailable || console.warn(`Unable to load worklet file from ${this.config.workletPath}. Worklet-based processing will be disabled. Verify the workletPath configuration setting is set correctly and the file is available.`)

    this.config.audioContext.resume()
    for (const listener of this.gestureListeners) {
      listener(this.config.audioContext)
    }
  }

  /**
   * Register a function to be called once the audio engine is ready and a user gesture has been performed.
   * 
   * @param callback A function to run once the audio engine is ready.
   */
  run(callback: (ctx?: AudioContext) => void) {
    if (!this.runCalled) this.createInitListeners()
    this.runCalled = true

    if (this.isInitialized) {
      callback(this.config.audioContext)
    } else {
      this.gestureListeners.push(callback)
    }
  }

  withConfig(
    customConfigOptions: Partial<AudioConfig> = {},
    configId?: string
  ) {
    customConfigOptions.logger ??= new this.internals.SignalLogger()
    const config = { ...this.config, ...customConfigOptions }
    const namespace: typeof this.internals = baseWithConfig(config, configId)
    return new IATopLevel(config, namespace)
  }

  stackChannels(inputs: Connectable[]) {
    return this.internals.ChannelStacker.fromInputs(inputs)
  }

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