import { Component } from "../../components/base/Component.js"
import { resolvePromiseArgs } from "../../shared/decorators.js"
import { CanBeConnectedTo } from "../../shared/types.js"
import { AudioRateInput } from "../input/AudioRateInput.js"
import { ComponentInput } from "../input/ComponentInput.js"
import { AbstractOutput } from "./AbstractOutput.js"

export class ControlOutput<T> extends AbstractOutput<T> {
  numOutputChannels: number = 1
  connect<T extends CanBeConnectedTo>(destination: T): Component | undefined {
    let { component, input } = this.getDestinationInfo(destination)
    // TODO: fix... should be "destination" but won't work for non-connectables like Function.
    /* const connectable = destination instanceof AbstractInput ? destination : component */
    // Conversion. TODO: figure out how to treat ComponentInput.
    if (input instanceof AudioRateInput && !(input instanceof ComponentInput)) {
      const converter = new this._.ControlToAudioConverter()
      converter.connect(input)
      input = converter.input
    }
    if (input._uuid in this.connections) {
      throw new Error(`The given input ${input} (${input._uuid}) is already connected.`)
    }
    this.connections[input._uuid] = input
    return component
  }
  @resolvePromiseArgs
  setValue(value: T | Promise<T>, rawObject: boolean = false) {
    value = <T>value
    this.validate(value)
    if (value?.constructor === Object && rawObject) {
      value = { _raw: true, ...value }
    }
    for (let c of Object.values(this.connections)) {
      c.setValue(value)
    }
    for (const callback of this.callbacks) {
      callback(value)
    }
  }
  onUpdate(callback: (val?: T) => void) {
    this.callbacks.push(callback)
  }
}