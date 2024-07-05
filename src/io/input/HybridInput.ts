import { Component } from "../../components/base/Component.js"
import { WebAudioConnectable } from "../../shared/types.js"
import { AbstractInput } from "./AbstractInput.js"
import constants from "../../shared/constants.js"
import { MultiChannel, createMultiChannelView } from "../../shared/multichannel.js"

export class HybridInput<T> extends AbstractInput<T> implements MultiChannel<HybridInput<T>> {
  readonly channels: this[]
  activeChannel: number = undefined

  private _value: T
  // Hybrid input can connect an audio input to a sink, but it also can
  // receive control inputs.
  constructor(
    public name: string, 
    public parent: Component,
    public audioSink: WebAudioConnectable,
    defaultValue: T = constants.UNSET_VALUE,
    public isRequired: boolean = false
  ) {
    super(name, parent, isRequired)
    this._value = defaultValue
    this.channels = createMultiChannelView(this, audioSink)
  }
  get left(): this {
    return this.channels[0]
  }
  get right(): this {
    return this.channels[1] ?? this.left
  }
  get value(): T {
    return this._value
  }
  setValue(value: T) {
    if (value == constants.TRIGGER && this.value != undefined) {
      value = this.value
    }
    this._value = value
    if (isFinite(+value)) {
      this.audioSink["value"] = +value
    }
    this.parent?.propagateUpdatedInput(this, value)
  }
}