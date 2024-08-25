import { Connectable } from "../shared/base/Connectable.js"
import { BaseComponent } from "./base/BaseComponent.js"
import constants from "../shared/constants.js"
// @ts-ignore No d.ts file.
import describeFunction from 'function-descriptor'
import { AnyFn } from "../shared/types.js"
import { AbstractInput } from "../io/input/AbstractInput.js"
import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { enumerate, isPlainObject, range } from "../shared/util.js"

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
    let argInfos: { hasDefault: boolean, name: string }[] = []
    for (let i = 0; i < parameters.length; i++) {
      const arg = parameters[i]
      if (arg.destructureType == "spread") {
        // Fill it with 10 extra args.
        const restArgs = (range(10) as any).fill({ hasDefault: true, name: undefined })
        argInfos.push(...restArgs)
        break
      } else if (arg.destructureType) {
        arg.name = undefined
      }
      argInfos.push(arg)
    }
    for (const [i, arg] of enumerate(argInfos)) {
      // Define input and its alias.
      const indexName = "$" + i
      // @ts-ignore Improper index type.
      this[indexName] = this.defineControlInput(indexName, constants.UNSET_VALUE, !arg.hasDefault)
      if (arg.name) {
        const inputName = "$" + arg.name
        // @ts-ignore Improper index type.
        this[inputName] = this.defineInputAlias(inputName, this[indexName])
      }
      // @ts-ignore Improper index type.
      this._orderedFunctionInputs.push(this[indexName])
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
    let definedArgsLength: number = args.length
    for (const i of range(args.length).reverse()) {
      if (args[i] != constants.UNSET_VALUE) {
        definedArgsLength = i + 1
        break
      }
    }
    const result = this.fn(...args.slice(0, definedArgsLength))
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
    if (isPlainObject(inputs[0])) {
      inputDict = inputs[0]
    } else {
      if (inputs.length > this._orderedFunctionInputs.length) {
        throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this._orderedFunctionInputs.length} but got ${inputs.length}.`)
      }
      for (let i = 0; i < inputs.length; i++) {
        inputDict["$" + i] = inputs[i]
      }
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
