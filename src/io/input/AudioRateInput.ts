import { Component } from "../../components/base/Component.js"
import { AbstractInput } from "./AbstractInput.js"
import constants from "../../shared/constants.js"
import { WebAudioConnectable } from "../../shared/types.js"
import { MultiChannel, createMultiChannelView } from "../../shared/multichannel.js"

export class AudioRateInput extends AbstractInput<number> implements MultiChannel<AudioRateInput> {
  readonly channels: this[]
  activeChannel: number = undefined

  constructor(
    public name: string,
    public parent: Component,
    public audioSink: WebAudioConnectable
  ) {
    super(name, parent, false)
    this.channels = createMultiChannelView(this, audioSink)
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
    if (value == constants.TRIGGER) {
      value = this.value
    }
    this.audioSink["value"] = value
  }
}