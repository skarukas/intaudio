import { AudioRateInput, AudioRateOutput, ControlOutput, HybridInput, HybridOutput } from "../../internals.js";
import { AbstractInput } from "../../io/input/AbstractInput.js";
import { ControlInput } from "../../io/input/ControlInput.js";
import { ComponentInput } from "../../io/input/ComponentInput.js";
import { AbstractOutput } from "../../io/output/AbstractOutput.js";
import { BaseConnectable } from "../../shared/base/BaseConnectable.js";

import constants from "../../shared/constants.js";
import { WebAudioConnectable, CanBeConnectedTo } from "../../shared/types.js";
import { FunctionComponent } from "../FunctionComponent.js";
import { Component } from "./Component.js";

export abstract class BaseComponent extends BaseConnectable implements Component {
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
    this.isBypassed = this._defineControlInput('isBypassed', false)
    this.isMuted = this._defineControlInput('isMuted', false)
    this.triggerInput = this._defineControlInput('triggerInput')

    // Special inputs that are not automatically set as default I/O.
    this._reservedInputs = [this.isBypassed, this.isMuted, this.triggerInput]
    this._reservedOutputs = []
    this._preventIOOverwrites()
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
  _now() {
    return this.audioContext.currentTime
  }
  _validateIsSingleton() {
    const Class = (<typeof FunctionComponent>this.constructor)
    if (Class.instanceExists) {
      throw new Error(`Only one instance of ${this.constructor} can exist.`)
    }
    Class.instanceExists = true
  }

  _preventIOOverwrites() {
    Object.keys(this.inputs).map(this.#freezeProperty.bind(this))
    Object.keys(this.outputs).map(this.#freezeProperty.bind(this))
  }
  #freezeProperty(propName) {
    Object.defineProperty(this, propName, {
      writable: false,
      configurable: false
    })
  }
  #defineInputOrOutput(propName, inputOrOutput, inputsOrOutputsArray) {
    inputsOrOutputsArray[propName] = inputOrOutput
    return inputOrOutput
  }

  _defineControlInput<T>(
    name: string,
    defaultValue: T = constants.UNSET_VALUE,
    isRequired: boolean = false
  ): ControlInput<T> {
    let input = new this._.ControlInput(name, this, defaultValue, isRequired)
    return this.#defineInputOrOutput(name, input, this.inputs)
  }
  _defineAudioInput(
    name: string,
    destinationNode: WebAudioConnectable
  ): AudioRateInput {
    let input = new this._.AudioRateInput(name, this, destinationNode)
    return this.#defineInputOrOutput(name, input, this.inputs)
  }
  _defineHybridInput<T>(
    name: string,
    destinationNode: WebAudioConnectable,
    defaultValue: T = constants.UNSET_VALUE,
    isRequired: boolean = false
  ): HybridInput<T> {
    let input = new this._.HybridInput(name, this, destinationNode, defaultValue, isRequired)
    return this.#defineInputOrOutput(name, input, this.inputs)
  }
  _defineControlOutput(name: string): ControlOutput<any> {
    let output = new this._.ControlOutput(name)
    return this.#defineInputOrOutput(name, output, this.outputs)
  }
  _defineAudioOutput(name: string, audioNode: AudioNode): AudioRateOutput {
    let output = new this._.AudioRateOutput(name, audioNode)
    return this.#defineInputOrOutput(name, output, this.outputs)
  }
  _defineHybridOutput(name: string, audioNode: AudioNode): HybridOutput {
    let output = new this._.HybridOutput(name, audioNode)
    return this.#defineInputOrOutput(name, output, this.outputs)
  }
  _setDefaultInput(input: AbstractInput) {
    this._defaultInput = input
  }
  _setDefaultOutput(output: AbstractOutput) {
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

  #allInputsAreDefined() {
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
    } else if (this.#allInputsAreDefined()) {
      this.inputDidUpdate(inputStream, newValue)
    } else {
      console.warn("Not passing event because not all required inputs are defined.")
    }
  }

  // Abstract methods.
  outputAdded(output) { }
  inputAdded(output) { }
  onBypassEvent(event) { }
  onMuteEvent(event) { }
  inputDidUpdate(input, newValue) { }
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
    if (!input) {
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
  setValues(valueObj) {
    return this.getDefaultInput().setValue(valueObj)
  }
  wasConnectedTo(other) {
    this.inputAdded(other)
    return other
  }
  sampleSignal(samplePeriodMs?: number) {
    return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs))
  }
}
