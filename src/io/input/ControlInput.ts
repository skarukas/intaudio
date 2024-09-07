import { Component } from "../../components/base/Component.js"
import constants from "../../shared/constants.js"
import { resolvePromiseArgs } from "../../shared/decorators.js"
import { AbstractInput } from "./AbstractInput.js"

export class ControlInput<T> extends AbstractInput<T> {
  readonly numInputChannels: number = 1
  _value: T
  constructor(
    public name: string | number,
    parent: Component,
    defaultValue: T = <any>constants.UNSET_VALUE,
    isRequired: boolean = false
  ) {
    super(name, parent, isRequired)
    this._value = defaultValue
  }
  get value(): T {
    return this._value
  }
  @resolvePromiseArgs
  setValue(value: T | Promise<T>) {
    value = <T>value
    this.validate(value)
    if (value == constants.TRIGGER && this.value != undefined) {
      value = this.value
    }
    this._value = value
    this.parent?.propagateUpdatedInput(this, value)
  }
}