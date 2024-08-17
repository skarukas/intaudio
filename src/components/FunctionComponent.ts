import { Connectable } from "../shared/base/Connectable.js"
import { BaseComponent } from "./base/BaseComponent.js"
import constants from "../shared/constants.js"
// @ts-ignore No d.ts file.
import describeFunction from 'function-descriptor'
import { AnyFn } from "../shared/types.js"
import { AbstractInput } from "../io/input/AbstractInput.js"
import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"

// TODO: create shared base class with AudioTransformComponent.
export class FunctionComponent<T0 = any, T1 = any, T2 = any, T3 = any, T4 = any, T5 = any, R = any> extends BaseComponent {
  readonly $0?: ControlInput<T0>;
  readonly $1?: ControlInput<T1>;
  readonly $2?: ControlInput<T2>;
  readonly $3?: ControlInput<T3>;
  readonly $4?: ControlInput<T4>;
  readonly $5?: ControlInput<T5>;

  output: ControlOutput<R>

  protected _orderedFunctionInputs: Array<ControlInput<any>> = []

  constructor(fn: Function)
  constructor(fn: () => R)
  constructor(fn: (a0?: T0) => R)
  constructor(fn: (a0?: T0, a1?: T1) => R)
  constructor(fn: (a0?: T0, a1?: T1, a2?: T2) => R)
  constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3) => R)
  constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4) => R)
  constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5) => R)
  constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5, ...args: any[]) => R);
  constructor(public fn: AnyFn<T0, T1, T2, T3, T4, T5, R>) {
    super()
    const descriptor = describeFunction(fn)
    const parameters = descriptor.parameters

    for (let i = 0; i < parameters.length; i++) {
      const arg = parameters[i]
      const inputName = "$" + arg.name
      const indexName = "$" + i
      const isRequired = !arg.hasDefault
      if (arg.destructureType == "rest") {
        // Can't use it or anything after it
        break
      } else if (arg.destructureType) {
        throw new Error(`Invalid function for FunctionComponent. Parameters cannot use array or object destructuring. Given: ${arg.rawName}`)
      }


      // Define input and its alias.
      // @ts-ignore Improper index type.
      this[inputName] = this.defineControlInput(inputName, constants.UNSET_VALUE, isRequired)
      // @ts-ignore Improper index type.
      this[indexName] = this.defineInputAlias(indexName, this[inputName])
      // @ts-ignore Improper index type.
      this._orderedFunctionInputs.push(this[inputName])
    }
    let requiredArgs = parameters.filter((a: any) => !a.hasDefault)
    if (requiredArgs.length == 1) {
      // @ts-ignore Improper index type.
      this.setDefaultInput(this["$" + requiredArgs[0].name])
    }

    this.output = this.defineControlOutput('output')
    this.preventIOOverwrites()
  }
  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    const args = this._orderedFunctionInputs.map(eachInput => eachInput.value)
    const result = this.fn(...args)
    this.output.setValue(result)
  }
  override __call__(...inputs: Array<Connectable | unknown>): this;
  override __call__(inputDict: { [name: string]: Connectable | unknown }): this;
  override __call__(...inputs: any): this {
    return this.withInputs(...inputs)
  }
  override withInputs(...inputs: Array<Connectable | unknown>): this;
  override withInputs(inputDict: { [name: string]: Connectable | unknown }): this;
  override withInputs(...inputs: any): this {
    let inputDict: { [name: string]: Connectable | unknown } = {};
    if (inputs[0]?.connect) {  // instanceof Connectable
      if (inputs.length > this._orderedFunctionInputs.length) {
        throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this._orderedFunctionInputs.length} but got ${inputs.length}.`)
      }
      for (let i = 0; i < inputs.length; i++) {
        inputDict["$" + i] = inputs[i]
      }
    } else {
      inputDict = inputs[0]
    }
    super.withInputs(inputDict)
    return this
  }
}

class HasDynamicInput {
  [key: string]: AbstractInput<unknown>;
}

// Define static type on FunctionComponent.
export module FunctionComponent {
  export type Dynamic = FunctionComponent & HasDynamicInput
}
