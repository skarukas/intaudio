import { Component } from "../../components/base/Component.js"
import { NodeInputPort } from "../../shared/AudioPort.js"
import constants from "../../shared/constants.js"
import { createMultiChannelView } from "../../shared/multichannel.js"
import { MultiChannel, WebAudioConnectable } from "../../shared/types.js"
import { isType } from "../../shared/util.js"
import { MultiChannelArray } from "../../worklet/lib/types.js"
import { AbstractInput } from "./AbstractInput.js"

export class AudioRateInput extends AbstractInput<number> implements MultiChannel<AudioRateInput> {
  readonly channels: MultiChannelArray<this>
  activeChannel: number | undefined = undefined
  port: NodeInputPort

  get numInputChannels(): number {
    return this.activeChannel ? 1 : this.port.numChannels
  }

  constructor(
    public name: string | number,
    public parent: Component | undefined,
    port: NodeInputPort | WebAudioConnectable
  ) {
    super(name, parent, false)
    this.port = isType(port, [AudioNode, AudioParam])
      ? new this._.NodeInputPort(port as WebAudioConnectable)
      : port as NodeInputPort
    this.channels = createMultiChannelView(this, this.port?.node instanceof AudioNode)
  }
  get left(): this {
    return this.channels[0]
  }
  get right(): this {
    return this.channels[1] ?? this.left
  }
  get value() {
    return this.port.node instanceof AudioParam ? this.port.node.value : 0
  }
  setValue(value: number | typeof constants.TRIGGER) {
    this.validate(value)
    if (value == constants.TRIGGER) {
      value = this.value
    }
    if (this.port.node instanceof AudioParam && isType(value, Number)) {
      this.port.node.setValueAtTime(value, 0)
    }
  }
}


// TODO: implement AudioParam interface.
/* 
export class AudioParamControlOutput extends ControlOutput<any> implements AudioParam {
  connections: AudioParam[]
  connect(destination: CanBeConnectedTo) {
    let { component, input } = this.getDestinationInfo(destination)
    if (input instanceof AudioRateInput) {
      this.connections.push(destination)
    } else {
      throw new Error("The output must be an audio-rate input.")
    }
    return destination
  }
  protected map(key: keyof AudioParam, args: any): this {
    for (let connection of this.connections) {
      connection[key](...args)
    }
    return this
  }
  cancelAndHoldAtTime(cancelTime: number) {
    return this.map('cancelAndHoldAtTime', arguments)
  }
  cancelScheduledValues(cancelTime: number) {
    return this.map('cancelScheduledValues', arguments)
  }
  exponentialRampToValueAtTime(value: number, endTime: number) {
    return this.map('exponentialRampToValueAtTime', arguments)
  }
  linearRampToValueAtTime(value: number, endTime: number) {
    return this.map('linearRampToValueAtTime', arguments)
  }
  setTargetAtTime(value: number, startTime: number, timeConstant: number) {
    return this.map('setTargetAtTime', arguments)
  }
  setValueAtTime(value: number, startTime: number) {
    return this.map('setValueAtTime', arguments)
  }
  setValueCurveAtTime(values: number[], startTime: number, duration: number) {
    return this.map('setValueCurveAtTime', arguments)
  }
} */