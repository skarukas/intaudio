import { Component } from "../../components/base/Component.js"
import { BaseConnectable } from "../../shared/base/BaseConnectable.js"
import { Constructor } from "../../shared/types.js"
import { createTypeValidator, wrapValidator } from "../../shared/util.js"
import { HasTypeValidator } from "../HasTypeValidator.js"
import { AbstractInput } from "../input/AbstractInput.js"

export abstract class AbstractOutput<T = any> extends BaseConnectable implements HasTypeValidator {
  protected validate: (value: any) => void = () => null
  constructor(public name: string | number, public parent?: Component) {
    super()
  }
  connections: AbstractInput[] = []
  abstract get numOutputChannels(): number;
  callbacks: Array<(val?: T) => void> = []
  ofType(type: Constructor | string): this {
    this.withValidator(createTypeValidator(type))
    return this
  }
  toString() {
    if (this.parent == undefined) {
      return `${this._className}('${this.name}')`
    }
    return `${this.parent._className}.outputs.${this.name}`
  }
  get defaultOutput(): AbstractOutput | undefined {
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