import { Component } from "../../components/base/Component.js"
import { ToStringAndUUID } from "../../shared/base/ToStringAndUUID.js"
import constants from "../../shared/constants.js"
import { Constructor } from "../../shared/types.js"
import { createTypeValidator, wrapValidator } from "../../shared/util.js"
import { HasTypeValidator } from "../HasTypeValidator.js"

export abstract class AbstractInput<T = any> extends ToStringAndUUID implements HasTypeValidator {
  protected validate: (value: any) => void = () => null
  constructor(public name: string | number, public parent: Component, public isRequired: boolean) {
    super()
  }
  abstract get value(): T;
  abstract setValue(value: T): void;
  abstract get numInputChannels(): number;

  __call__(value: T | typeof constants.TRIGGER = constants.TRIGGER): void {
    this.setValue(<T>value)
  }
  trigger() {
    this.setValue(<T>constants.TRIGGER)
  }
  ofType(type: Constructor | string): this {
    this.withValidator(createTypeValidator(type))
    return this
  }
  /**
   * The validator function can either throw an error or return false.
   */
  withValidator(validatorFn: (v: any) => boolean | void): this {
    this.validate = wrapValidator(validatorFn)
    return this
  }
}