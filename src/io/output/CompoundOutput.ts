import { Component } from "../../components/base/Component.js";
import { createMultiChannelView } from "../../shared/multichannel.js";
import { CanBeConnectedTo, KeysLike, MultiChannel, ObjectOf } from "../../shared/types.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
import { CompoundInput } from "../input/CompoundInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
import { AudioRateOutput } from "./AudioRateOutput.js";

type OutputTypes<T> = {
  [K in keyof T]: T[K] extends AbstractOutput<infer Inner> ? Inner : unknown
}

export class CompoundOutput<OutputsDict extends ObjectOf<AbstractOutput>>
  extends AbstractOutput<OutputTypes<OutputsDict>>
  implements MultiChannel<AbstractOutput> {
  connect<T extends Component>(destination: T): T;
  connect<T extends CanBeConnectedTo>(destination: T): Component;
  connect(destination: CanBeConnectedTo) {
    let { component, input } = this.getDestinationInfo(destination)
    if (input instanceof CompoundInput) {
      // First priority: try to connect all to same-named inputs.
      // TODO: could this requirement be configured to allow connection either:
      // - When inputs are a superset
      // - When any input matches
      // TODO: might be good to check the types are compatible as well.
      const inputIsSuperset = [...this.keys].every(v => input.keys.has(v))
      if (inputIsSuperset) {
        for (const key of this.keys) {
          this.outputs[key].connect(input.inputs[key])
        }
      }
    } else if (this.defaultOutput) {
      // Second priority: connect only default.
      // TODO: implement logic in each "sub-output" connect handler.
      this.defaultOutput.connect(input)
    }
    return component
  }

  channels: MultiChannelArray<this>;
  activeChannel: number | undefined = undefined
  outputs: OutputsDict = <any>{}
  get keys() {
    return new Set(Object.keys(this.outputs))
  }
  get left(): AbstractOutput<any> {
    return this.channels[0]
  }
  get right(): AbstractOutput<any> {
    return this.channels[1] ?? this.left
  }
  private _defaultOutput: AbstractOutput | undefined
  get defaultOutput(): AbstractOutput | undefined {
    return this._defaultOutput
  }
  constructor(
    public name: string | number,
    outputs: OutputsDict,
    public parent?: Component,
    defaultOutput?: AbstractOutput
  ) {
    super(name, parent)
    this._defaultOutput = defaultOutput

    let hasMultichannelInput = false
    // Define 'this.outputs' and 'this' interface for underlying inputs.
    Object.keys(outputs).map(name => {
      const output = outputs[name]
      hasMultichannelInput ||= output instanceof AudioRateOutput
      if (Object.prototype.hasOwnProperty(name)) {
        console.warn(`Cannot create top-level CompoundOutput property '${name}' because it is reserved. Use 'outputs.${name}' instead.`)
      }
      for (const obj of [this, this.outputs]) {
        Object.defineProperty(obj, name, {
          get() {
            return (this.activeChannel != undefined && output instanceof AudioRateOutput) ? output.channels[this.activeChannel] : output
          },
          enumerable: true
        })
      }
    })
    this.channels = createMultiChannelView(this, hasMultichannelInput)
  }
  protected mapOverOutputs<T>(
    fn: (i: AbstractOutput, name: string | number) => T
  ): KeysLike<OutputsDict, T> {
    const res = {}
    for (const outputName of this.keys) {
      (<any>res)[outputName] = fn(this.outputs[outputName], outputName)
    }
    return res
  }
  get numOutputChannels() {
    const ic = this.mapOverOutputs(i => i.numOutputChannels)
    return Math.max(...Object.values(<ObjectOf<number>>ic))
  }
}