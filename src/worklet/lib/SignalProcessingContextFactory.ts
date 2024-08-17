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
  numChannelsPerInput: number[]
  numChannelsPerOutput: number[]
  getFrameIndex: () => number
  getCurrentTime: () => number

  constructor({
    // TODO: consider using StreamSpec here.
    numChannelsPerInput,
    numChannelsPerOutput,
    windowSize,
    dimension,
    getFrameIndex,
    getCurrentTime,
    sampleRate,
  }: {
    numChannelsPerInput: number[],
    numChannelsPerOutput: number[],
    windowSize: number,
    dimension: D,
    sampleRate: number,
    getFrameIndex: () => number,
    getCurrentTime: () => number,
  }) {
    this.windowSize = windowSize
    this.sampleRate = sampleRate
    this.numChannelsPerInput = numChannelsPerInput
    this.numChannelsPerOutput = numChannelsPerOutput
    this.getCurrentTime = getCurrentTime
    this.getFrameIndex = getFrameIndex

    const genInput = this.getDefaultValueFn({
      dimension,
      windowSize,
      numChannelsPerStream: numChannelsPerInput
    })
    const genOutput = this.getDefaultValueFn({
      dimension,
      windowSize,
      numChannelsPerStream: numChannelsPerOutput
    })
    const hasChannelSpecificProcessing = ["all", "channels"].includes(dimension)
    if (hasChannelSpecificProcessing) {
      this.inputHistory[ALL_CHANNELS] = <any>new MemoryBuffer(genInput)
      this.outputHistory[ALL_CHANNELS] = <any>new MemoryBuffer(genOutput)
    } else {
      if (!allEqual(numChannelsPerInput)) {
        throw new Error(`Only dimensions 'all' and 'channels' may have inconsistent numbers of input channels. Given dimension=${dimension}, numChannelsPerInput=${numChannelsPerInput}.`)
      }
      if (!allEqual(numChannelsPerOutput)) {
        throw new Error(`Only dimensions 'all' and 'channels' may have inconsistent numbers of output channels. Given dimension=${dimension}, numChannelsPerOutput=${numChannelsPerOutput}.`)
      }
      // Each channel is processed the same.
      for (let c = 0; c < numChannelsPerInput[0]; c++) {
        this.inputHistory[c] = <any>new MemoryBuffer(genInput)
      }
      for (let c = 0; c < numChannelsPerOutput[0]; c++) {
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
        numInputs: this.numChannelsPerInput.length,
        numOutputs: this.numChannelsPerOutput.length,
        sampleRate: this.sampleRate,
        frameIndex: this.getFrameIndex(),
        currentTime: this.getCurrentTime()
      }
    )
  }
}