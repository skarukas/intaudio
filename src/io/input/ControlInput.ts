import { Component } from "../../components/base/Component.js"
import { AbstractInput } from "./AbstractInput.js"
import constants from "../../shared/constants.js"

export class ControlInput<T> extends AbstractInput<T> {
  _value: T
  constructor(
    public name: string, 
    parent: Component,
    defaultValue: T = constants.UNSET_VALUE,
    isRequired: boolean = false
  ) {
    super(name, parent, isRequired)
    this._value = defaultValue
  }
  get value(): T {
    return this._value
  }
  setValue(value: T) {
    if (value == constants.TRIGGER && this.value != undefined) {
      value = this.value
    }
    this._value = value
    this.parent?.propagateUpdatedInput(this, value)
  }
}