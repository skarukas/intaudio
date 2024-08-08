import { Component } from "../../components/base/Component.js"
import { AbstractInput } from "./AbstractInput.js"
import constants from "../../shared/constants.js"
import { MultiChannel, WebAudioConnectable } from "../../shared/types.js"
import { createMultiChannelView, getNumInputChannels } from "../../shared/multichannel.js"
import { MultiChannelArray } from "../../worklet/lib/types.js"

export class AudioRateInput extends AbstractInput<number> implements MultiChannel<AudioRateInput> {
  readonly channels: MultiChannelArray<this>
  activeChannel: number = undefined
  get numInputChannels(): number {
    return this.activeChannel ? 1 : getNumInputChannels(this.audioSink)
  }

  constructor(
    public name: string | number,
    public parent: Component,
    public audioSink: WebAudioConnectable
  ) {
    super(name, parent, false)
    this.channels = createMultiChannelView(this, audioSink instanceof AudioNode)
  }
  get left(): this {
    return this.channels[0]
  }
  get right(): this {
    return this.channels[1] ?? this.left
  }
  get value() {
    return this.audioSink["value"]  // TODO: fix? AudioNodes have no value.
  }
  setValue(value: number | typeof constants.TRIGGER) {
    this.validate(value)
    if (value == constants.TRIGGER) {
      value = this.value
    }
    this.audioSink["value"] = value
  }
}