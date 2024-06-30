import { Component } from "../../components/base/Component.js"
import { AbstractInput } from "./AbstractInput.js"
import constants from "../../shared/constants.js"
import { WebAudioConnectable } from "../../shared/types.js"

export class AudioRateInput extends AbstractInput<number> {
  constructor(
    public name: string,
    public parent: Component,
    public audioSink: WebAudioConnectable
  ) {
    super(name, parent, false)
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