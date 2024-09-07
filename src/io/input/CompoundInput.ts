import { Component } from "../../components/base/Component.js";
import { createMultiChannelView } from "../../shared/multichannel.js";
import { KeysLike, MultiChannel, ObjectOf } from "../../shared/types.js";
import { isPlainObject } from "../../shared/util.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
import { AbstractInput } from "./AbstractInput.js";
import { AudioRateInput } from "./AudioRateInput.js";

type InputTypes<T> = {
  [K in keyof T]: T[K] extends AbstractInput<infer Inner> ? Inner : unknown
}

export class CompoundInput<InputsDict extends ObjectOf<AbstractInput>>
  extends AbstractInput<InputTypes<InputsDict>>
  implements MultiChannel<AbstractInput> {

  protected _defaultInput: AbstractInput<any> | undefined
  channels: MultiChannelArray<this>;
  activeChannel: number | undefined = undefined
  inputs: InputsDict = <any>{}
  get left(): AbstractInput<any> {
    return this.channels[0]
  }
  get right(): AbstractInput<any> {
    return this.channels[1] ?? this.left
  }
  get keys() {
    return new Set(Object.keys(this.inputs))
  }
  get defaultInput() {
    return this._defaultInput
  }
  constructor(
    public name: string | number,
    public parent: Component,
    inputs: InputsDict,
    defaultInput?: AbstractInput
  ) {
    super(name, parent, false)
    let hasMultichannelInput = false
    // Define 'this.inputs' and 'this' interface for underlying inputs.
    Object.keys(inputs).map(name => {
      const input = inputs[name]
      hasMultichannelInput ||= input instanceof AudioRateInput && input.port instanceof AudioNode
      if (Object.prototype.hasOwnProperty(name)) {
        console.warn(`Cannot create top-level CompoundInput property '${name}' because it is reserved. Use 'inputs.${name}' instead.`)
      }
      for (const obj of [this, this.inputs]) {
        Object.defineProperty(obj, name, {
          get() {
            return (this.activeChannel != undefined && input instanceof AudioRateInput) ? input.channels[this.activeChannel] : input
          },
          enumerable: true
        })
      }
    })
    this.channels = createMultiChannelView(this, hasMultichannelInput)
    this._defaultInput = defaultInput
  }
  protected mapOverInputs<T>(
    fn: (i: AbstractInput, name: string | number) => T
  ): KeysLike<InputsDict, T> {
    const res = {}
    for (const inputName of this.keys) {
      (<any>res)[inputName] = fn(this.inputs[inputName], inputName)
    }
    return res as KeysLike<InputsDict, T>
  }
  get numInputChannels() {
    const ic = this.mapOverInputs(i => i.numInputChannels)
    return Math.max(...Object.values(<ObjectOf<number>>ic))
  }
  get value(): InputTypes<InputsDict> {
    return <any>this.mapOverInputs(input => input.value)
  }
  setValue(valueDict: InputTypes<InputsDict>): void
  setValue(valueForDefaultInput: any): void
  setValue(value: any): void {
    if (isPlainObject(value) && Object.keys(value).every(k => this.keys.has(k))) {
      // If each key is a valid value, assign it as such.
      this.mapOverInputs((input, name) => input.setValue(value[name]))
    } else if (this.defaultInput) {
      // Assume it's an input for the default input.
      this.defaultInput.setValue(value)
    } else {
      throw new Error(`The given compound input (${this}) has no default input, so setValue expected a plain JS object with keys equal to a subset of ${[...this.keys]}. Given: ${value} (${JSON.stringify(value)}). Did you intend to call setValue of one of its named inputs (.inputs[inputName])instead?`)
    }
  }
}