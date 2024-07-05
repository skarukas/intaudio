import { AudioRateSignalSampler } from "../../components/AudioRateSignalSampler.js"
import { Component } from "../../components/base/Component.js"
import { AudioSignalStream } from "../../shared/AudioSignalStream.js"
import { MultiChannel, connectWebAudioChannels, createMultiChannelView } from "../../shared/multichannel.js"
import { CanBeConnectedTo } from "../../shared/types.js"
import { AudioRateInput } from "../input/AudioRateInput.js"
import { HybridInput } from "../input/HybridInput.js"
import { AbstractOutput } from "./AbstractOutput.js"

// TODO: Add a GainNode here to allow muting and mastergain of the component.
export class AudioRateOutput extends AbstractOutput<number> implements MultiChannel<AudioRateOutput>, AudioSignalStream {
  private _channels: this[] = undefined
  activeChannel = undefined

  constructor(public name: string, public audioNode: AudioNode) {
    super(name)
  }
  get channels(): this[] {
    return this._channels ?? (this._channels = createMultiChannelView(this, this.audioNode))
  }
  get left(): AudioRateOutput {
    return this.channels[0]
  }
  get right(): AudioRateOutput {
    return this.channels[1] ?? this.left
  }
  connect<T extends Component>(destination: T): T;
  connect<T extends CanBeConnectedTo>(destination: T): Component;
  connect(destination) {
    let { component, input } = this.getDestinationInfo(destination)
    if (!(input instanceof AudioRateInput || input instanceof HybridInput)) {
      throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use ${AudioRateSignalSampler.name} to force a conversion.`)
    }
    input.audioSink && connectWebAudioChannels(
      this.audioContext,
      this.audioNode,
      input.audioSink,
      this.activeChannel,
      input.activeChannel
    )
    this.connections.push(input)
    component?.wasConnectedTo(this)
    return component
  }
  sampleSignal(samplePeriodMs?: number): AudioRateSignalSampler {
    return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs))
  }
  splitChannels(...inputChannelGroups: number[][]): Iterable<AudioRateOutput> {
    if (inputChannelGroups.length > 32) {
      throw new Error("Can only split into 32 or fewer channels.")
    }
    if (inputChannelGroups.length) {
      return this.connect(new this._.ChannelSplitter(...inputChannelGroups))
    } else {
      // This is an optimization that returns the channel views instead of 
      // split+merged channels.
      return this.channels
    }
  }
}