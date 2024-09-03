import { Component } from "../../components/base/Component.js"
import { AudioSignalStream } from "../../shared/AudioSignalStream.js"
import constants from "../../shared/constants.js"
import { FFTStream } from "../../shared/FFTStream.js"
import { connectWebAudioChannels, createMultiChannelView, getNumInputChannels, getNumOutputChannels } from "../../shared/multichannel.js"
import { CanBeConnectedTo, MultiChannel, WebAudioConnectable } from "../../shared/types.js"
import { range } from "../../shared/util.js"
import { AudioDimension, MultiChannelArray } from "../../worklet/lib/types.js"
import { AudioRateInput } from "../input/AudioRateInput.js"
import { ComponentInput } from "../input/ComponentInput.js"
import { HybridInput } from "../input/HybridInput.js"
import { AbstractOutput } from "./AbstractOutput.js"

// TODO: Add a GainNode here to allow muting and mastergain of the component.
export class AudioRateOutput
  extends AbstractOutput<number>
  implements MultiChannel<AudioRateOutput>, AudioSignalStream {
  private _channels: MultiChannelArray<AudioRateOutput> | undefined = undefined
  activeChannel = undefined

  constructor(
    public name: string | number,
    public audioNode: AudioNode,
    public parent?: Component
  ) {
    super(name, parent)
  }
  get channels(): MultiChannelArray<AudioRateOutput> {
    return this._channels ?? (this._channels = createMultiChannelView(this, true))
  }
  get left(): AudioRateOutput {
    return this.channels[0]
  }
  get right(): AudioRateOutput {
    return this.channels[1] ?? this.left
  }
  get numInputChannels(): number {
    return this.activeChannel != undefined ? 1 : getNumInputChannels(this.audioNode)
  }
  get numOutputChannels(): number {
    return this.activeChannel != undefined ? 1 : getNumOutputChannels(this.audioNode)
  }
  toString() {
    const superCall = super.toString()
    return this.activeChannel == undefined ?
      superCall
      : `${superCall}.channels[${this.activeChannel}]`
  }
  private connectNodes(
    from: AudioNode,
    to: WebAudioConnectable,
    fromChannel: number | undefined = undefined,
    toChannel: number | undefined = undefined
  ) {
    to && connectWebAudioChannels(this.audioContext, from, to, fromChannel, toChannel)
  }
  connect<T extends Component>(destination: T): T;
  connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
  connect(destination: CanBeConnectedTo) {
    let { component, input } = this.getDestinationInfo(destination)
    input = input instanceof ComponentInput ? <any>input.defaultInput : input
    if (!input) {
      const inputs = component == undefined ? [] : Object.keys(component.inputs)
      throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${inputs}]`)
    }
    if (!(input instanceof AudioRateInput || input instanceof HybridInput)) {
      throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use 'AudioRateSignalSampler' to force a conversion.`)
    }
    this.connectNodes(
      this.audioNode,
      input.audioSink,
      this.activeChannel,
      input.activeChannel
    )
    if (input._uuid in this.connections) {
      throw new Error(`The given input ${input} (${input._uuid}) is already connected.`)
    }
    this.connections[input._uuid] = input
    component?.wasConnectedTo(this)
    return component
  }
  sampleSignal(samplePeriodMs?: number): Component {
    return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs))
  }
  // TODO: Make a single global sampler so that all signals are logged together.
  logSignal({
    samplePeriodMs = 1000,
    format
  }: {
    samplePeriodMs?: number,
    format?: string
  } = {}): this {
    if (!format) {
      format = ""
      // Maybe add parent
      if (this.parent != undefined) {
        const shortId = this.parent._uuid.split("-")[0]
        format += `${this.parent.constructor.name}#${shortId}.`
      }
      format += this.name
      // Maybe add channel spec
      if (this.activeChannel != undefined) {
        format += `.channels[${this.activeChannel}]`
      }
      format += ": {}"
    }
    // TODO: Could this be optimized? Also, make this log the array, each channel.
    this.config.logger.register(this, format)
    return this
  }
  splitChannels(...inputChannelGroups: number[][]): Iterable<AudioRateOutput> {
    if (inputChannelGroups.length > 32) {
      throw new Error("Can only split into 32 or fewer channels.")
    }
    if (!inputChannelGroups.length) {
      // Split each channel separately: [0], [1], [2], etc.
      for (let i = 0; i < this.numOutputChannels; i++) {
        inputChannelGroups.push([i])
      }
      /* // Seems to be broken? Consider removing "channel views" as they do not 
      // have a correct channel count etc.
      // This is an optimization that returns the channel views instead of 
      // split+merged channels.
      return this.channels */
    }
    return this.connect(new this._.ChannelSplitter(...inputChannelGroups))
  }
  transformAudio(
    fn: (input: MultiChannelArray<Float32Array>) => (number[] | Float32Array)[],
    {
      windowSize,
      useWorklet,
      dimension
    }: {
      windowSize?: number,
      useWorklet?: boolean,
      dimension: "all"
    }
  ): Component;
  transformAudio(
    fn: (input: MultiChannelArray<number>) => number[],
    {
      useWorklet,
      dimension
    }: {
      useWorklet?: boolean,
      dimension: "channels"
    }
  ): Component;
  transformAudio(
    fn: (samples: Float32Array) => (Float32Array | number[]),
    {
      windowSize,
      useWorklet,
      dimension
    }: {
      windowSize?: number,
      useWorklet?: boolean,
      dimension: "time"
    }
  ): Component;
  transformAudio(
    fn: (x: number) => number,
    {
      useWorklet,
      dimension
    }: {
      useWorklet?: boolean,
      dimension?: "none"
    }
  ): Component;
  transformAudio(
    fn: Function,
    {
      windowSize,
      useWorklet,
      dimension = "none"
    }: {
      windowSize?: number,
      useWorklet?: boolean,
      dimension?: AudioDimension
    } = {}
  ): Component {
    const options = {
      dimension,
      windowSize,
      useWorklet,
      numChannelsPerInput: [this.numOutputChannels],
      numInputs: 1
    }
    const transformer = new this._.AudioTransformComponent(fn, options)
    return <Component>this.connect(transformer.inputs[0])  // First input of the function.
  }
  disconnect(destination: CanBeConnectedTo) {
    // TODO: implement this and utilize it for temporary components / nodes.
    console.warn("Disconnect not yet supported.")
  }
  /**
   * Return the current audio samples.
   */
  capture(numSamples: number): Promise<AudioBuffer[]> {
    const recorder = new this._.AudioRecordingComponent()
    this.connect(recorder)
    const buffer = recorder.capture(numSamples)
    this.disconnect(recorder)
    return buffer
  }
  fft(fftSize: number = 128): FFTStream {
    const component = new this._.FFTComponent(fftSize)
    this.connect(component.realInput)
    this.connect(component.imaginaryInput)
    return component.fftOut
  }
  toChannels(
    numChannels: number,
    mode: 'speakers' | 'discrete' | 'repeat' = 'speakers'
  ): Component {
    if (mode == 'repeat') {
      // Custom mode -- repeat all the channels you have to fill the target.
      let c = 0
      const channels: AudioRateOutput[] = []
      for (const _ of range(numChannels)) {
        channels.push(this.channels[c])
        // Cycle over available channels.
        c = (c + 1) % this.numOutputChannels
      }
      return this._.ChannelStacker.fromInputs(channels)
    } else {
      // Native WebAudio up- or down-mixing to the right number of channels.
      const gain = new GainNode(
        this.audioContext,
        {
          channelCount: numChannels,
          channelCountMode: "explicit",
          channelInterpretation: mode
        })
      return this.connect(gain) as Component
    }
  }
}