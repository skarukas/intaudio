import { Component } from "../../components/base/Component.js"
import { MultiChannel, WebAudioConnectable } from "../../shared/types.js"
import { AbstractInput } from "./AbstractInput.js"
import constants from "../../shared/constants.js"
import { createMultiChannelView, getNumInputChannels } from "../../shared/multichannel.js"
import { resolvePromiseArgs } from "../../shared/decorators.js"
import { MultiChannelArray } from "../../worklet/lib/types.js"
import { isType } from "../../shared/util.js"

// TODO: remove this and HybridOutput.
export class HybridInput<T> extends AbstractInput<T> implements MultiChannel<HybridInput<T>> {
  get numInputChannels(): number {
    return this.activeChannel ? 1 : getNumInputChannels(this.audioSink)
  }
  readonly channels: MultiChannelArray<this>
  activeChannel: number | undefined = undefined

  private _value: T | undefined
  // Hybrid input can connect an audio input to a sink, but it also can
  // receive control inputs.
  constructor(
    public name: string | number,
    public parent: Component,
    public audioSink: WebAudioConnectable,
    defaultValue: T | undefined = constants.UNSET_VALUE,
    public isRequired: boolean = false
  ) {
    super(name, parent, isRequired)
    this._value = defaultValue
    this.channels = createMultiChannelView(this, audioSink instanceof AudioNode)
  }
  get left(): this {
    return this.channels[0]
  }
  get right(): this {
    return this.channels[1] ?? this.left
  }
  get value(): T | undefined {
    return this._value
  }
  @resolvePromiseArgs
  setValue(value: T | Promise<T>) {
    value = <T>value
    this.validate(value)
    if (value == constants.TRIGGER && this.value != undefined) {
      value = this.value
    }
    this._value = value
    if (isFinite(+value) && isType(this.audioSink, AudioParam)) {
      this.audioSink.setValueAtTime(+value, 0)
    }
    this.parent?.propagateUpdatedInput(this, value)
  }
}