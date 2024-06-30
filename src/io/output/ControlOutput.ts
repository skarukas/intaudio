import { Component } from "../../components/base/Component.js"
import { CanBeConnectedTo } from "../../shared/types.js"
import { AbstractInput } from "../input/AbstractInput.js"
import { AbstractOutput } from "./AbstractOutput.js"

export class ControlOutput<T> extends AbstractOutput<T> {
  connect<T extends CanBeConnectedTo>(destination: T): Component {
    let { component, input } = this.getDestinationInfo(destination)
    // TODO: fix... should be "destination" but won't work for non-connectables like Function.
    /* const connectable = destination instanceof AbstractInput ? destination : component */
    this.connections.push(input)
    return component
  }
  setValue(value: T, rawObject: boolean = false) {
    if (value?.constructor === Object && rawObject) {
      value = { _raw: true, ...value }
    }
    for (let c of this.connections) {
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