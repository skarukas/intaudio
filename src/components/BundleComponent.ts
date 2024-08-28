import { AbstractInput } from "../io/input/AbstractInput.js";
import { ComponentInput } from "../io/input/ComponentInput.js";
import { CompoundInput } from "../io/input/CompoundInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { AbstractOutput } from "../io/output/AbstractOutput.js";
import { CompoundOutput } from "../io/output/CompoundOutput.js";
import { Connectable } from "../shared/base/Connectable.js";
import { CanBeConnectedTo, KeysLike, ObjectOf, ObjectOrArrayOf } from "../shared/types.js";
import { enumerate, isType } from "../shared/util.js";
import { map } from "../worklet/lib/utils.js";
import { AudioTransformComponent } from "./AudioTransformComponent.js";
import { BaseComponent } from "./base/BaseComponent.js";
import { Component } from "./base/Component.js";
import { FunctionComponent } from "./FunctionComponent.js";

/**
 * Represents a group of components that can be operated on independently.
 */
export class BundleComponent<ComponentDict extends ObjectOf<Component>> extends BaseComponent implements Component, Iterable<Component> {
  protected componentObject: ObjectOf<Component>
  protected componentValues: Component[]
  // @ts-ignore Index signature leads to 'undefined' value type.
  input: CompoundInput<KeysLike<ComponentDict, AbstractInput>>
  // @ts-ignore Index signature leads to 'undefined' value type.
  output: CompoundOutput<KeysLike<ComponentDict, AbstractOutput>>
  length: number

  constructor(components: ComponentDict | Array<Component>) {
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
    for (const [i, key] of enumerate(Object.keys(this.componentObject))) {
      // @ts-ignore No index signature.
      // TODO: export intersection with index signature type.
      this[key] = this.componentObject[key]
      this.defineInputAlias(key, this.componentObject[key].getDefaultInput())
      if (i + '' != key) {
        // @ts-ignore No index signature.
        this[i] = this.componentObject[key]
        this.defineInputAlias(i, this.componentObject[key].getDefaultInput())
      }
      if (this.componentObject[key].defaultOutput) {
        this.defineOutputAlias(key, this.componentObject[key].defaultOutput)
      }
    }
    this.input = this.defineCompoundInput(
      'input',
      map(this.componentObject, c => c.defaultInput) as KeysLike<ComponentDict, AbstractInput>
    )
    this.setDefaultInput(this.input)
    this.output = this.defineCompoundOutput(
      'output',
      map(this.componentObject, c => c.defaultOutput) as KeysLike<ComponentDict, AbstractOutput>
    )
    this.setDefaultOutput(this.output)
    this.length = this.componentValues.length
  }
  get isControlStream() {
    return this.componentValues.every(c => c.isControlStream)
  }
  get isAudioStream() {
    return this.componentValues.every(c => c.isAudioStream)
  }
  get isStftStream() {
    return this.componentValues.every(c => c.isStftStream)
  }
  [Symbol.iterator](): Iterator<Component> {
    return this.componentValues[Symbol.iterator]()
  }
  getDefaultInput(): ComponentInput<unknown> {
    throw new Error("Method not implemented.");
  }
  get defaultOutput() {
    return undefined
  }
  get numOutputChannels() {
    return Math.max(...this.componentValues.map(
      c => (c as BaseComponent).numOutputChannels
    )) || 0
  }
  get numInputChannels() {
    return Math.max(...this.componentValues.map(
      c => (c as BaseComponent).numInputChannels
    )) || 0
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
    if (isType(component, FunctionComponent)
      || isType(component, AudioTransformComponent)) {
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