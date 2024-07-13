import { AbstractInput } from "../../io/input/AbstractInput.js";
import { ControlInput } from "../../io/input/ControlInput.js";
import { ComponentInput } from "../../io/input/ComponentInput.js";
import { AbstractOutput } from "../../io/output/AbstractOutput.js";
import { BaseConnectable } from "../../shared/base/BaseConnectable.js";

import constants from "../../shared/constants.js";
import { WebAudioConnectable, CanBeConnectedTo } from "../../shared/types.js";
import { FunctionComponent } from "../FunctionComponent.js";
import { Component } from "./Component.js";
import { Connectable } from "../../shared/base/Connectable.js";
import { AudioSignalStream } from "../../shared/AudioSignalStream.js";
import { ControlOutput } from "../../io/output/ControlOutput.js";
import { AudioRateOutput } from "../../io/output/AudioRateOutput.js";
import { HybridInput } from "../../io/input/HybridInput.js";
import { HybridOutput } from "../../io/output/HybridOutput.js";
import { AudioRateInput } from "../../io/input/AudioRateInput.js";
import { MultiChannelArray } from "../../shared/multichannel.js";

export abstract class BaseComponent extends BaseConnectable implements Component, AudioSignalStream {
  readonly isComponent = true
  private static instanceExists = false
  outputs: { [name: string]: AbstractOutput } = {};
  inputs: { [name: string]: AbstractInput } = {};

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
  private defineInputOrOutput(propName, inputOrOutput, inputsOrOutputsArray) {
    inputsOrOutputsArray[propName] = inputOrOutput
    return inputOrOutput
  }
  protected defineOutputAlias<T>(name: string, output: AbstractOutput<T>): AbstractOutput<T> {
    return this.defineInputOrOutput(name, output, this.outputs)
  }
  protected defineInputAlias<T>(name: string, input: AbstractInput<T>): AbstractInput<T> {
    return this.defineInputOrOutput(name, input, this.inputs)
  }
  protected defineControlInput<T>(
    name: string,
    defaultValue: T = constants.UNSET_VALUE,
    isRequired: boolean = false
  ): ControlInput<T> {
    let input = new this._.ControlInput(name, this, defaultValue, isRequired)
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
  protected defineControlOutput(name: string | number): ControlOutput<any> {
    let output = new this._.ControlOutput(name)
    return this.defineInputOrOutput(name, output, this.outputs)
  }
  protected defineAudioOutput(name: string | number, audioNode: AudioNode): AudioRateOutput {
    let output = new this._.AudioRateOutput(name, audioNode)
    return this.defineInputOrOutput(name, output, this.outputs)
  }
  protected defineHybridOutput(name: string | number, audioNode: AudioNode): HybridOutput {
    let output = new this._.HybridOutput(name, audioNode)
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
      const thisInput = this.inputs[name] ?? this.inputs[""+name] ?? this.inputs["$" + name]
      if (!thisInput) {
        throw new Error(`No input found named '${name}'. Valid inputs: [${Object.keys(this.inputs)}]`)
      }
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
  protected getAudioOutputProperty(propName: string) {
    const output = this.getDefaultOutput()
    if (output instanceof AudioRateOutput) {
      const prop = output[propName]
      return prop instanceof Function ? prop.bind(output) : prop
    } else {
      throw new Error(`Cannot get property '${propName}'. No default audio-rate output found for ${this}. Select an audio-rate output and use 'output.${propName}' instead.`)
    }
  }
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
  transformAudio(fn: (input: MultiChannelArray<Float32Array>) => (number[] | Float32Array)[], dimension: "all", { windowSize, useWorklet}?: { windowSize?: number, useWorklet?: boolean }): Component;
  transformAudio(fn: (input: MultiChannelArray<number>) => number[], dimension: "channels", { useWorklet }?: { useWorklet?: boolean }): Component;
  transformAudio(fn: (samples: Float32Array) => (Float32Array | number[]), dimension: "time", { windowSize, useWorklet}?: { windowSize?: number, useWorklet?: boolean }): Component;
  transformAudio(fn: (x: number) => number, dimension?: "none", { useWorklet }?: { useWorklet?: boolean }): Component;
  transformAudio(
    fn: unknown,
    dimension: unknown = "none",
    { windowSize, useWorklet }: { windowSize?: number, useWorklet?: boolean } = {}): Component {
    return this.getAudioOutputProperty('transformAudio')(fn, dimension, { windowSize, useWorklet })
  }
}
