import { Component } from "../../components/base/Component.js";
import { KeysLike, MultiChannel, ObjectOf } from "../../internals.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
import { AbstractInput } from "./AbstractInput.js";
import { AudioRateInput } from "./AudioRateInput.js";
import { ControlInput } from "./ControlInput.js";

type InputTypes<T> = {
  [K in keyof T]: T[K] extends AbstractInput<infer Inner> ? Inner : unknown
}

export class CompoundInput<InputsDict extends ObjectOf<AbstractInput>>
  extends AbstractInput<InputTypes<InputsDict>>
  implements MultiChannel<AbstractInput> {

  channels: MultiChannelArray<this>;
  activeChannel: number = undefined
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
  constructor(
    public name: string | number,
    public parent: Component,
    inputs: InputsDict,
    public defaultInput?: AbstractInput
  ) {
    super(name, parent, false)
    // Define 'this.inputs' and 'this' interface for underlying inputs.
    Object.keys(inputs).map(name => {
      const input = inputs[name]
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
  }
  protected mapOverInputs<T>(
    fn: (i: AbstractInput, name: string | number) => T
  ): KeysLike<InputsDict, T> {
    const res = {}
    for (const inputName of this.keys) {
      (<any>res)[inputName] = fn(this.inputs[inputName], inputName)
    }
    return res
  }
  get numInputChannels() {
    const ic = this.mapOverInputs(i => i.numInputChannels)
    return Math.max(...Object.values(ic))
  }
  get value(): InputTypes<InputsDict> {
    return <any>this.mapOverInputs(input => input.value)
  }
  setValue(valueDict: InputTypes<InputsDict>): void {
    this.mapOverInputs((input, name) => input.setValue(valueDict[name]))
  }
}