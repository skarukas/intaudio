// A special wrapper for a symbolic input that maps object signals to property assignments.
// let i = new ComponentInput(parent)

import { BaseComponent } from "../../components/base/BaseComponent.js"
import { AbstractInput } from "./AbstractInput.js"
import { AudioRateInput } from "./AudioRateInput.js"
import { HybridInput } from "./HybridInput.js"

// i.setValue({ input1: "val1", input2: "val2" })  // sets vals on parent.
export class ComponentInput<T> extends AudioRateInput {
  private _value: T
  constructor(
    public name: string, 
    parent: BaseComponent,
    public defaultInput?: AbstractInput<T>
  ) {
    const audioNode = (defaultInput instanceof AudioRateInput || defaultInput instanceof HybridInput) ? defaultInput.audioSink : undefined
    super(name, parent, audioNode)
    this.defaultInput = defaultInput
    this._value = defaultInput?.value
  }
  setValue(value: any) {
    // JS objects represent collections of parameter names and values
    const isPlainObject = value?.constructor === Object
    if (isPlainObject && !value["_raw"]) {
      
      // Validate each param is defined in the target.
      for (let key in <object>value) {
        if (!(key in this.parent.inputs)) {
          throw new Error(`Given parameter object ${JSON.stringify(value)} but destination ${this.parent} has no input named '${key}'. To pass a raw object without changing properties, set _raw: true on the object.`)
        }
      }
      for (let key in <object>value) {
        this.parent.inputs[key].setValue(value[key])
      }
    } else if (this.defaultInput == undefined) {
      throw new Error(`Component ${this.parent} unable to receive input because it has no default input configured. Either connect to one of its named inputs [${Object.keys(this.parent.inputs)}], or send a message as a plain JS object, with one or more input names as keys. Given ${JSON.stringify(value)}`)
    } else {
      isPlainObject && delete value["_raw"]
      this.defaultInput.setValue(value)
    }
  }
}
