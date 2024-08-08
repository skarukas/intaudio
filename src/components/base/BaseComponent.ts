import { AbstractInput } from "../../io/input/AbstractInput.js";
import { ControlInput } from "../../io/input/ControlInput.js";
import { ComponentInput } from "../../io/input/ComponentInput.js";
import { AbstractOutput } from "../../io/output/AbstractOutput.js";
import { BaseConnectable } from "../../shared/base/BaseConnectable.js";

import constants from "../../shared/constants.js";
import { WebAudioConnectable, CanBeConnectedTo, ObjectOrArrayOf, ObjectOf, KeysLike, AnyInput, AnyOutput, Bundle } from "../../shared/types.js";
import { FunctionComponent } from "../FunctionComponent.js";
import { Component } from "./Component.js";
import { Connectable } from "../../shared/base/Connectable.js";
import { AudioSignalStream } from "../../shared/AudioSignalStream.js";
import { ControlOutput } from "../../io/output/ControlOutput.js";
import { AudioRateOutput } from "../../io/output/AudioRateOutput.js";
import { HybridInput } from "../../io/input/HybridInput.js";
import { HybridOutput } from "../../io/output/HybridOutput.js";
import { AudioRateInput } from "../../io/input/AudioRateInput.js";
import { MultiChannelArray, toMultiChannelArray } from "../../worklet/lib/types.js";
import { arrayToObject, enumerate, isFunction, range, zip } from "../../shared/util.js";
import { BundleComponent } from "../BundleComponent.js";
import { lazyProperty } from "../../shared/decorators.js";
import { CompoundInput } from "../../io/input/CompoundInput.js";
import { CompoundOutput } from "../../io/output/CompoundOutput.js";
import { FFTComponent } from "../FFTComponent.js";
import { FFTStream } from "../../shared/FFTStream.js";

const SPEC_MATCH_REST_SYMBOL = "*"
const SPEC_SPLIT_SYMBOL = ","

type ChannelKey = "left" | "right" | number

export abstract class BaseComponent<
  InputTypes extends AnyInput = AnyInput,
  OutputTypes extends AnyOutput = AnyOutput
> extends BaseConnectable implements Component<InputTypes, OutputTypes>, AudioSignalStream {
  readonly isComponent = true
  private static instanceExists = false
  inputs: InputTypes = <any>{};
  outputs: OutputTypes = <any>{};

  isBypassed: ControlInput<boolean>
  isMuted: ControlInput<boolean>
  triggerInput: ControlInput<typeof constants.TRIGGER>

  private _defaultInput: AbstractInput
  private _defaultOutput: AbstractOutput
  private _reservedInputs: Array<AbstractInput>
  private _reservedOutputs: Array<AbstractOutput>
  constructor() {
    super()
    // Reserved default inputs.
    this.isBypassed = this.defineControlInput('isBypassed', false)
    this.isMuted = this.defineControlInput('isMuted', false)
    this.triggerInput = this.defineControlInput('triggerInput')

    // Special inputs that are not automatically set as default I/O.
    this._reservedInputs = [this.isBypassed, this.isMuted, this.triggerInput]
    this._reservedOutputs = []
    this.preventIOOverwrites()
  }
  logSignal({
    samplePeriodMs = 1000,
    format
  }: {
    samplePeriodMs?: number,
    format?: string
  } = {}): this {
    this.getAudioOutputProperty('logSignal')({
      samplePeriodMs,
      format
    })
    return this
  }
  capture(numSamples: number): Promise<AudioBuffer[]> {
    return this.getAudioOutputProperty('capture')(numSamples)
  }

  toString() {
    function _getNames(obj, except) {
      let entries = Object.keys(obj).filter(i => !except.includes(obj[i]))
      if (entries.length == 1) {
        return `${entries.join(", ")}`
      }
      return `(${entries.join(", ")})`
    }
    let inp = _getNames(this.inputs, this._reservedInputs)
    let out = _getNames(this.outputs, this._reservedOutputs)
    return `${this._className}(${inp} => ${out})`
  }
  protected now() {
    return this.audioContext.currentTime
  }
  protected validateIsSingleton() {
    const Class = (<typeof FunctionComponent>this.constructor)
    if (Class.instanceExists) {
      throw new Error(`Only one instance of ${this.constructor} can exist.`)
    }
    Class.instanceExists = true
  }

  protected preventIOOverwrites() {
    Object.keys(this.inputs).map(this.freezeProperty.bind(this))
    Object.keys(this.outputs).map(this.freezeProperty.bind(this))
  }
  private freezeProperty(propName) {
    Object.defineProperty(this, propName, {
      writable: false,
      configurable: false
    })
  }
  protected defineInputOrOutput(propName, inputOrOutput, inputsOrOutputsArray) {
    inputsOrOutputsArray[propName] = inputOrOutput
    return inputOrOutput
  }
  protected defineOutputAlias<T>(name: string, output: AbstractOutput<T>): AbstractOutput<T> {
    return this.defineInputOrOutput(name, output, this.outputs)
  }
  protected defineInputAlias<T>(name: string | number, input: T): T {
    return this.defineInputOrOutput(name, input, this.inputs)
  }
  protected defineControlInput<T>(
    name: string | number,
    defaultValue: T = constants.UNSET_VALUE,
    isRequired: boolean = false
  ): ControlInput<T> {
    let input = new this._.ControlInput(name, this, defaultValue, isRequired)
    return this.defineInputOrOutput(name, input, this.inputs)
  }
  protected defineCompoundInput<T extends ObjectOf<AbstractInput>>(
    name: string | number,
    inputs: T,
    defaultInput?: AbstractInput
  ): CompoundInput<T> {
    let input = new this._.CompoundInput(name, this, inputs, defaultInput)
    return this.defineInputOrOutput(name, input, this.inputs)
  }
  protected defineAudioInput(
    name: string | number,
    destinationNode: WebAudioConnectable
  ): AudioRateInput {
    let input = new this._.AudioRateInput(name, this, destinationNode)
    return this.defineInputOrOutput(name, input, this.inputs)
  }
  protected defineHybridInput<T>(
    name: string | number,
    destinationNode: WebAudioConnectable,
    defaultValue: T = constants.UNSET_VALUE,
    isRequired: boolean = false
  ): HybridInput<T> {
    let input = new this._.HybridInput(name, this, destinationNode, defaultValue, isRequired)
    return this.defineInputOrOutput(name, input, this.inputs)
  }
  protected defineCompoundOutput<T extends ObjectOf<AbstractOutput>>(
    name: string | number,
    outputs: T,
    defaultOutput?: AbstractOutput
  ): CompoundOutput<T> {
    let output = new this._.CompoundOutput(name, outputs, this, defaultOutput)
    return this.defineInputOrOutput(name, output, this.outputs)
  }
  protected defineControlOutput(name: string | number): ControlOutput<any> {
    let output = new this._.ControlOutput(name, this)
    return this.defineInputOrOutput(name, output, this.outputs)
  }
  protected defineAudioOutput(name: string | number, audioNode: AudioNode): AudioRateOutput {
    let output = new this._.AudioRateOutput(name, audioNode, this)
    return this.defineInputOrOutput(name, output, this.outputs)
  }
  protected defineHybridOutput(name: string | number, audioNode: AudioNode): HybridOutput {
    let output = new this._.HybridOutput(name, audioNode, this)
    return this.defineInputOrOutput(name, output, this.outputs)
  }
  protected setDefaultInput(input: AbstractInput) {
    this._defaultInput = input
  }
  protected setDefaultOutput(output: AbstractOutput) {
    this._defaultOutput = output
  }
  getDefaultInput(): ComponentInput<any> {
    const name = 'default'
    if (this._defaultInput) {
      return new this._.ComponentInput(name, this, this._defaultInput)
    }
    // Skip reserved inputs, e.g. isMuted / isBypassed
    const ownInputs = Object.values(this.inputs).filter(i => !this._reservedInputs.includes(i))
    if (ownInputs.length == 1) {
      return new this._.ComponentInput(name, this, ownInputs[0])
    }
    return new this._.ComponentInput(name, this)
  }

  getDefaultOutput(): AbstractOutput {
    if (this._defaultOutput) {
      return this._defaultOutput
    }
    // Skip reserved outputs
    const ownOutputs = Object.values(this.outputs).filter(i => !this._reservedOutputs.includes(i))
    if (ownOutputs.length == 1) {
      return ownOutputs[0]
    }
  }

  protected allInputsAreDefined() {
    let violations = []
    for (let inputName in this.inputs) {
      let input = this.inputs[inputName]
      if (input.isRequired && input.value == constants.UNSET_VALUE) {
        violations.push(inputName)
      }
    }
    return !violations.length
    /* if (violations.length) {
      throw new Error(`Unable to run ${this}. The following inputs are marked as required but do not have inputs set: [${violations}]`)
    } */
  }

  propagateUpdatedInput(inputStream, newValue) {
    if (inputStream == this.isBypassed) {
      this.onBypassEvent(newValue)
    } else if (inputStream == this.isMuted) {
      this.onMuteEvent(newValue)
    }
    if (inputStream == this.triggerInput) {
      // Always execute function, even if it's unsafe.
      this.inputDidUpdate(undefined, undefined)
    } else if (this.allInputsAreDefined()) {
      this.inputDidUpdate(inputStream, newValue)
    } else {
      console.warn("Not passing event because not all required inputs are defined.")
    }
  }

  // Abstract methods.
  protected outputAdded(output) { }
  protected inputAdded(output) { }
  protected onBypassEvent(event) { }
  protected onMuteEvent(event) { }
  protected inputDidUpdate(input, newValue) { }
  processEvent(event) {
    // Method describing how an incoming event is mutated before passing to the
    // component outputs.
    return event
  }

  setBypassed(isBypassed = true) {
    this.isBypassed.setValue(isBypassed)
  }
  setMuted(isMuted = true) {
    this.isMuted.setValue(isMuted)
  }

  connect<T extends CanBeConnectedTo>(destination: T): Component {
    let { component, input } = this.getDestinationInfo(destination)
    if (!input || (input instanceof ComponentInput && !input.defaultInput)) {
      throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${Object.keys(component.inputs)}]`)
    }
    component && this.outputAdded(input)
    const output = this.getDefaultOutput()
    if (!output) {
      throw new Error(`No default output found for ${this}, so unable to connect to destination: ${component}. Found named outputs: [${Object.keys(this.outputs)}]`)
    }
    output.connect(input)
    return component
  }
  withInputs(argDict: { [name: string | number]: Connectable | unknown }): this {
    for (const name in argDict) {
      const thisInput = this.inputs[name] ?? this.inputs["" + name] ?? this.inputs["$" + name]
      if (!thisInput) continue
      const argValue = argDict[name]
      if (argValue instanceof Object && 'connect' in argValue) {
        (<Connectable>argValue).connect(thisInput)
      } else {
        thisInput.setValue(argValue)
      }
    }
    return this
  }
  setValues(valueObj) {
    return this.getDefaultInput().setValue(valueObj)
  }
  wasConnectedTo(other) {
    this.inputAdded(other)
    return other
  }
  protected getInputsBySpecs(inputSpecs: (string | string[])[]): AbstractInput[][] {
    return this.getBySpecs(inputSpecs, this.inputs)
  }
  protected getChannelsBySpecs(channelSpecs: (string | (number | string)[])[]): AbstractOutput[][] {
    const output = this.getDefaultOutput()
    if (!(output instanceof AudioRateOutput || output instanceof HybridOutput)) {
      throw new Error("No default audio-rate output found. Select a specific output to use this operation.")
    }
    // Convert to stringified numbers.
    const numberedSpecs = channelSpecs.map(spec => {
      const toNumber = (c: string) => {
        const noSpace = String(c).replace(/s/g, "")
        if (noSpace == "left") return "0"
        if (noSpace == "right") return "1"
        return c
      }
      return spec instanceof Array ? spec.map(toNumber) : toNumber(spec)
    })
    const channelObj = arrayToObject(<any>output.channels)
    return this.getBySpecs(numberedSpecs, channelObj)
  }
  protected getOutputsBySpecs(outputSpecs: (string | string[])[]): AbstractOutput[][] {
    return this.getBySpecs(outputSpecs, this.outputs)
  }
  /**
   * Given an array of strings specifying which inputs/outputs to select, return an array of the same length where each entry contains the inputs/outputs matched by that spec.
   * 
   * Each spec is one of:
   * 1. A string representing a specific input or output name. Example: `"in1"`.
   * 2. An array of input or output names. Example: `["in1", "in2"]`.
   * 3. A stringified version of (2). Example: `"in1, in2"`.
   * 4. The string `"*"` which means to match any unspecified. This may only appear once.
   * 
   * NOTE: Any spaces will be removed, so `"in1,in2"`, `" in1 , in2 "`, and `"in1, in2"` are equivalent.
   */
  protected getBySpecs<T extends (AbstractInput | AbstractOutput)>(
    specs: (string | (number | string)[])[],
    obj: ObjectOf<T>
  ): T[][] {
    // Remove spaces.
    specs = specs.map(spec => {
      const removeSpaces = (s: string) => String(s).replace(/s/g, "")
      return spec instanceof Array ? spec.map(removeSpaces) : removeSpaces(spec)
    })

    const matchedObjects = specs.map(() => [])
    const matchedKeys = new Set()
    const starIndices = []  // Indices i in the list where specs[i] = "*"

    for (let [i, spec] of enumerate(specs)) {
      if (spec == SPEC_MATCH_REST_SYMBOL) {
        starIndices.push(i)
        continue
      } else if (!(spec instanceof Array)) {
        spec = spec.split(SPEC_SPLIT_SYMBOL)
      }
      spec.forEach(key => {
        if (matchedKeys.has(key)) {
          throw new Error(`Invalid spec. At most one instance of each key may be specified, but '${key}' was mentioned multiple times. Given: ${JSON.stringify(specs)}`)
        }
        matchedKeys.add(key)
      })
      matchedObjects[i] = spec.map(key => obj[key])
    }

    if (starIndices.length > 1) {
      throw new Error(`Invalid spec. At most one key may be '*'. Given: ${JSON.stringify(specs)}`)
    } else if (starIndices.length == 1) {
      // Get any unmatched inputs/outputs.
      matchedObjects[starIndices[0]] = Object.keys(obj)
        .filter(key => !matchedKeys.has(key))
        .map(key => obj[key])
    }
    return matchedObjects
  }
  /*   split(spec: ObjectOf<string | string[]>): Component;
    split(spec: ObjectOf<string | string[]>): Component;
      
    } */

  /**
   * Define a map from output name to a definition of the signal processing graph to connect it to.
   * 
   * TODO: Outputs that aren't mentioned should be passed through unchanged (currenly not supported bc they aren't components).
   * 
   * Ex: myComponent.perOutput({
   *   output1: o1 => o1.connect(ia.oscillator().frequency)
   * })
   */
  perOutput(
    functions: KeysLike<OutputTypes, (x: Connectable) => Component>
  )
  perOutput(
    functions: ((x: Connectable) => Component)[]
  )
  perOutput(
    functions: ObjectOrArrayOf<((x: Connectable) => Component)>
  ): BundleComponent {
    if (functions instanceof Array) functions = arrayToObject(functions)
    const result: ObjectOf<Component> = {}
    const keys = Object.keys(functions)
    const outputGroups = this.getOutputsBySpecs(keys)
    for (const [key, outputGroup] of zip(keys, outputGroups)) {
      if (isFunction(functions[key])) {
        // TODO: support these specs.
        if (key.includes(SPEC_SPLIT_SYMBOL)
          || key.includes(SPEC_MATCH_REST_SYMBOL)
        ) {
          throw new Error("Array and rest specs not currently supported.")
        }
        const res = functions[key](outputGroup[0])
        res && (result[key] = res)
      }
      // Otherwise, leave it out. TODO: Throw error if not explicitly null
      // or undefined?
    }
    return new this._.BundleComponent(result)
  }
  perChannel(
    functions: { left?: (x: Connectable) => Component, right?: (x: Connectable) => Component, [key: number]: (x: Connectable) => Component }
  )
  perChannel(
    functions: ((x: Connectable) => Component)[]
  )
  perChannel(
    functions: ObjectOrArrayOf<((x: Connectable) => Component)>
  ): Component {
    if (functions instanceof Array) functions = arrayToObject(functions)
    const keys = Object.keys(functions)
    const outputGroups = this.getChannelsBySpecs(keys)
    const result: Component[] = Array(outputGroups.length).fill(undefined)
    const toNum = (c: string) => {
      const noSpace = String(c).replace(/s/g, "")
      if (noSpace == "left") return "0"
      if (noSpace == "right") return "1"
      return c
    }
    for (const [key, outputGroup] of zip(keys, outputGroups)) {
      if (isFunction(functions[key])) {
        // TODO: support these specs.
        if (key.includes(SPEC_SPLIT_SYMBOL)
          || key.includes(SPEC_MATCH_REST_SYMBOL)
        ) {
          throw new Error("Array and rest specs not currently supported.")
        }
        const res = functions[key](outputGroup[0])
        res && (result[toNum(key)] = res)
      }
      // Otherwise, leave it out. TODO: Throw error if not explicitly null
      // or undefined?
    }
    return this._.ChannelStacker.fromInputs(result)
  }

  // Delegate the property to the default audio output (if any).
  protected getAudioOutputProperty(propName: string) {
    const output = this.getDefaultOutput()
    if (output instanceof AudioRateOutput) {
      const prop = output[propName]
      return isFunction(prop) ? prop.bind(output) : prop
    } else {
      throw new Error(`Cannot get property '${propName}'. No default audio-rate output found for ${this}. Select an audio-rate output and use 'output.${propName}' instead.`)
    }
  }

  /** Methods delegated to default audio input / output. **/
  get numInputChannels() {
    return this.getDefaultInput().numInputChannels
  }
  get numOutputChannels() {
    return this.getAudioOutputProperty('numOutputChannels')
  }
  sampleSignal(samplePeriodMs?: number): Component {
    return this.getAudioOutputProperty('sampleSignal')(samplePeriodMs)
  }
  splitChannels(...inputChannelGroups: number[][]): Iterable<AudioRateOutput> {
    return this.getAudioOutputProperty('splitChannels')(...inputChannelGroups)
  }
  // TODO: these should work as both inputs and outputs.
  get left(): AudioRateOutput {
    return this.getAudioOutputProperty('left')
  }
  get right(): AudioRateOutput {
    return this.getAudioOutputProperty('right')
  }
  get channels(): MultiChannelArray<AudioRateOutput> {
    return this.getAudioOutputProperty('channels')
  }
  transformAudio(fn: (input: MultiChannelArray<Float32Array>) => (number[] | Float32Array)[], { windowSize, useWorklet, dimension }?: { windowSize?: number, useWorklet?: boolean, dimension: "all" }): Component;
  transformAudio(fn: (input: MultiChannelArray<number>) => number[], { useWorklet, dimension }?: { useWorklet?: boolean, dimension: "channels" }): Component;
  transformAudio(fn: (samples: Float32Array) => (Float32Array | number[]), { windowSize, useWorklet, dimension }?: { windowSize?: number, useWorklet?: boolean, dimension: "time" }): Component;
  transformAudio(fn: (x: number) => number, { useWorklet, dimension }?: { useWorklet?: boolean, dimension?: "none" }): Component;
  transformAudio(
    fn: unknown,
    { windowSize, useWorklet, dimension = "none" }:
      { windowSize?: number, useWorklet?: boolean, dimension?: unknown } = {}
  ): Component {
    return this.getAudioOutputProperty('transformAudio')(fn, dimension, { windowSize, useWorklet })
  }
  fft(fftSize: number = 128): FFTStream {
    return this.getAudioOutputProperty('fft')(fftSize)
  }
}
