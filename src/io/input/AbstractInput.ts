import { Component } from "../../components/base/Component.js"
import { ToStringAndUUID } from "../../shared/base/ToStringAndUUID.js"
import constants from "../../shared/constants.js"

export abstract class AbstractInput<T = any> extends ToStringAndUUID {
  constructor(public name: string, public parent: Component, public isRequired: boolean) {
    super()
  }
  abstract get value(): T;
  abstract setValue(value: T): void;
  trigger() {
    this.setValue(<T>constants.TRIGGER)
  }
}