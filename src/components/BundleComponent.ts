import { AbstractInput } from "../io/input/AbstractInput.js";
import { ComponentInput } from "../io/input/ComponentInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { AbstractOutput } from "../io/output/AbstractOutput.js";
import { Connectable } from "../shared/base/Connectable.js";
import { CanBeConnectedTo, ObjectOf, ObjectOrArrayOf } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
import { Component } from "./base/Component.js";
import { FunctionComponent } from "./FunctionComponent.js";

/**
 * Represents a group of components that can be operated on independently.
 */
export class BundleComponent extends BaseComponent implements Component, Iterable<Component> {
  protected componentObject: { [key: number | string]: Component }
  protected componentValues: Component[]

  constructor(components: ObjectOrArrayOf<Component>) {
    super()
    if (components instanceof Array) {
      this.componentValues = components
      this.componentObject = {}
      for (let i = 0; i < components.length; i++) {
        this.componentObject[i] = components[i]
      }
    } else {
      this.componentValues = Object.values(components)
      this.componentObject = components
    }
    for (const key in this.componentObject) {
      // @ts-ignore No index signature.
      // TODO: export intersection with index signature type.
      this[key] = this.componentObject[key]
      this.defineInputAlias(key, this.componentObject[key].getDefaultInput())
      if (this.componentObject[key].defaultOutput) {
        this.defineOutputAlias(key, this.componentObject[key].defaultOutput)
      }
    }
  }
  [Symbol.iterator](): Iterator<Component> {
    return this.componentValues[Symbol.iterator]()
  }
  getDefaultInput(): ComponentInput<unknown> {
    throw new Error("Method not implemented.");
  }
  get defaultOutput(): AbstractOutput<unknown> {
    throw new Error("Method not implemented.");
  }
  setBypassed(isBypassed?: boolean): void {
    this.getBundledResult('setBypassed', isBypassed)
  }
  setMuted(isMuted?: boolean): void {
    this.getBundledResult('setMuted', isMuted)
  }
  protected getBundledResult(fnName: string, ...inputs: any[]) {
    const returnValues: ObjectOf<any> = {}
    for (const key in this.componentObject) {
      returnValues[key] = (<any>this.componentObject[key])[fnName](...inputs)
    }
    return new BundleComponent(returnValues)
  }
  connect<T extends CanBeConnectedTo>(destination: T): Component {
    let { component } = this.getDestinationInfo(destination)
    if (component instanceof FunctionComponent) {
      try {
        return component.withInputs(this.componentObject)
      } catch {
        // Try with ordered inputs if named inputs don't match.
        return component.withInputs(this.componentValues)
      }
    }
    const bundledResult = this.getBundledResult('connect', destination)
    // All entries will be the same, so just return the first.
    return Object.values(bundledResult)[0]
  }
  withInputs(inputDict: { [name: string]: Connectable; }): this {
    this.getBundledResult('withInputs', inputDict)
    return this
  }
  setValues(valueObj: any) {
    return this.getBundledResult('setValues', valueObj)
  }
  wasConnectedTo<T>(source: AbstractOutput<T>): AbstractOutput<T> {
    this.getBundledResult('wasConnectedTo', source)
    return source
  }
  // TODO: doesn't work.
  sampleSignal(samplePeriodMs?: number): Component {
    return this.getBundledResult('sampleSignal', samplePeriodMs)
  }
  propagateUpdatedInput<T>(input: AbstractInput<T>, newValue: T) {
    return this.getBundledResult('propagateUpdatedInput', input, newValue)
  }
}