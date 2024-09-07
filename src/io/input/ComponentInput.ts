// A special wrapper for a symbolic input that maps object signals to property assignments.
// let i = new ComponentInput(parent)

import { BaseComponent } from "../../components/base/BaseComponent.js"
import { NodeInputPort } from "../../shared/AudioPort.js"
import { AbstractInput } from "./AbstractInput.js"
import { AudioRateInput } from "./AudioRateInput.js"

// TODO: replace this whole class with compound input. This may require 
// refactoring of some code that relies on this class being a AudioRateInput 
// and having an audioNode.

// i.setValue({ input1: "val1", input2: "val2" })  // sets vals on parent.
export class ComponentInput<T> extends AudioRateInput {
  /*   private _value: T */
  protected _defaultInput: AbstractInput<T> | undefined
  get defaultInput() {
    return this._defaultInput
  }
  constructor(
    public name: string | number,
    parent: BaseComponent,
    defaultInput?: AbstractInput<T>
  ) {
    const port = defaultInput instanceof AudioRateInput ? defaultInput.port : undefined
    super(name, parent, port as NodeInputPort)  // TODO: fix this issue...
    this._defaultInput = defaultInput
    /* this._value = defaultInput?.value */
  }
  setValue(value: any) {
    this.validate(value)
    // JS objects represent collections of parameter names and values
    const isPlainObject = value?.constructor === Object
    if (isPlainObject && !value["_raw"]) {

      // Validate each param is defined in the target.
      for (const key in <object>value) {
        // TODO: refactor "$" + key to a shared method.
        if (!(this.parent && (key in this.parent.inputs || "$" + key in this.parent.inputs))) {
          throw new Error(`Given parameter object ${JSON.stringify(value)} but destination ${this.parent} has no input named '${key}' or '$${key}'. To pass a raw object without changing properties, set _raw: true on the object.`)
        }
      }
      for (const key in <object>value) {
        (this.parent?.inputs[key] ?? this.parent?.inputs["$" + key])?.setValue(value[key])
      }
    } else if (this.defaultInput == undefined) {
      const inputs = this.parent == undefined ? [] : Object.keys(this.parent.inputs)
      throw new Error(`Component ${this.parent} unable to receive input because it has no default input configured. Either connect to one of its named inputs [${inputs}], or send a message as a plain JS object, with one or more input names as keys. Given ${JSON.stringify(value)}`)
    } else {
      isPlainObject && delete value["_raw"]
      this.defaultInput.setValue(value)
    }
  }
}
