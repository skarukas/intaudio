import { StreamSpec } from "../../shared/StreamSpec.js"
import { FrameToSignatureConverter } from "./FrameToSignatureConverter.js"
import { MemoryBuffer } from "./MemoryBuffer.js"
import { SignalProcessingContext } from "./SignalProcessingContext.js"
import { AudioDimension, SignalProcessingFnInput } from "./types.js"
import { allEqual, generateZeroInput } from "./utils.js"

const ALL_CHANNELS = -1
/**
 * A class collecting all current ongoing memory streams. Because some `dimension` settings process channels in parallel (`"none"` and `"time"`), memory streams are indexed by channel.
 */
export class SignalProcessingContextFactory<D extends AudioDimension> {
  inputHistory: {
    [channel: number]: MemoryBuffer<SignalProcessingFnInput<D>[]>
  } = {}
  outputHistory: {
    [channel: number]: MemoryBuffer<SignalProcessingFnInput<D>>
  } = {}
  windowSize: number
  sampleRate: number
  inputSpec: StreamSpec
  outputSpec: StreamSpec
  getFrameIndex: () => number
  getCurrentTime: () => number
  ioConverter: FrameToSignatureConverter<D>

  constructor({
    inputSpec,
    outputSpec,
    windowSize,
    dimension,
    getFrameIndex,
    getCurrentTime,
    sampleRate,
  }: {
    inputSpec: StreamSpec,
    outputSpec: StreamSpec,
    windowSize: number,
    dimension: D,
    sampleRate: number,
    getFrameIndex: () => number,
    getCurrentTime: () => number,
  }) {
    this.windowSize = windowSize
    this.sampleRate = sampleRate
    this.inputSpec = inputSpec
    this.outputSpec = outputSpec
    this.getCurrentTime = getCurrentTime
    this.getFrameIndex = getFrameIndex
    this.ioConverter = new FrameToSignatureConverter(dimension, inputSpec, outputSpec)

    const genInput = this.getDefaultValueFn({
      dimension,
      windowSize,
      numChannelsPerStream: inputSpec.numChannelsPerStream
    })
    const genOutput = this.getDefaultValueFn({
      dimension,
      windowSize,
      numChannelsPerStream: outputSpec.numChannelsPerStream
    })
    const hasChannelSpecificProcessing = ["all", "channels"].includes(dimension)
    if (hasChannelSpecificProcessing) {
      this.inputHistory[ALL_CHANNELS] = <any>new MemoryBuffer(genInput)
      this.outputHistory[ALL_CHANNELS] = <any>new MemoryBuffer(genOutput)
    } else {
      if (!allEqual(inputSpec.numChannelsPerStream)) {
        throw new Error(`Only dimensions 'all' and 'channels' may have inconsistent numbers of input channels. Given dimension=${dimension}, inputSpec=${inputSpec}.`)
      }
      if (!allEqual(outputSpec.numChannelsPerStream)) {
        throw new Error(`Only dimensions 'all' and 'channels' may have inconsistent numbers of output channels. Given dimension=${dimension}, outputSpec=${outputSpec}.`)
      }
      // Each channel is processed the same.
      for (let c = 0; c < inputSpec.numChannelsPerStream[0]; c++) {
        this.inputHistory[c] = <any>new MemoryBuffer(genInput)
      }
      for (let c = 0; c < outputSpec.numChannelsPerStream[0]; c++) {
        this.outputHistory[c] = <any>new MemoryBuffer(genOutput)
      }
    }
  }
  protected getDefaultValueFn({
    dimension,
    windowSize,
    numChannelsPerStream
  }: {
    dimension: AudioDimension,
    windowSize: number,
    numChannelsPerStream: number[]
  }
  ) {
    return function genValue() {
      const defaultValue = []
      for (let i = 0; i < numChannelsPerStream.length; i++) {
        defaultValue.push(generateZeroInput(dimension, windowSize, numChannelsPerStream[i]))
      }
      return defaultValue
    }
  }

  getContext(
    {
      channelIndex = ALL_CHANNELS, sampleIndex = undefined
    }: {
      channelIndex?: number, sampleIndex?: number
    } = {}) {
    const inputMemory = this.inputHistory[channelIndex]
    const outputMemory = this.outputHistory[channelIndex]
    return new SignalProcessingContext(
      inputMemory,
      outputMemory,
      {
        windowSize: this.windowSize,
        channelIndex,
        sampleIndex,
        ioConverter: this.ioConverter,
        sampleRate: this.sampleRate,
        frameIndex: this.getFrameIndex(),
        currentTime: this.getCurrentTime()
      }
    )
  }
}