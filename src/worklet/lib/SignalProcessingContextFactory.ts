import { MemoryBuffer } from "./MemoryBuffer.js"
import { SignalProcessingContext } from "./SignalProcessingContext.js"
import { AudioDimension, SignalProcessingFnInput } from "./types.js"
import { generateZeroInput } from "./utils.js"

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
  getFrameIndex: () => number
  getCurrentTime: () => number

  constructor({
    numInputs,
    numChannelsPerInput,
    numOutputChannels,
    windowSize,
    dimension,
    sampleRate = undefined,
    getFrameIndex = undefined,
    getCurrentTime = undefined,
  }: {
    numInputs: number,
    numChannelsPerInput: number,
    numOutputChannels: number,
    windowSize: number,
    dimension: D,
    sampleRate: number,
    getFrameIndex: () => number,
    getCurrentTime: () => number,
  }) {
    this.windowSize = windowSize
    this.sampleRate = sampleRate
    this.getCurrentTime = getCurrentTime
    this.getFrameIndex = getFrameIndex

    const genInput = this.getDefaultInputValueFn({ dimension, numInputs, windowSize, numChannelsPerInput })
    const genOutput = this.getDefaultOutputValueFn({ dimension, windowSize, numOutputChannels })
    const hasChannelSpecificProcessing = ["all", "channels"].includes(dimension)
    if (hasChannelSpecificProcessing) {
      this.inputHistory[ALL_CHANNELS] = <any>new MemoryBuffer(genInput)
      this.outputHistory[ALL_CHANNELS] = <any>new MemoryBuffer(genOutput)
    } else {
      // Each channel is processed the same.
      for (let c = 0; c < numChannelsPerInput; c++) {
        this.inputHistory[c] = <any>new MemoryBuffer(genInput)
      }
      for (let c = 0; c < numOutputChannels; c++) {
        this.outputHistory[c] = <any>new MemoryBuffer(genOutput)
      }
    }
  }
  protected getDefaultInputValueFn({ dimension, numInputs, windowSize, numChannelsPerInput }) {
    return function genInput() {
      const defaultInput = []
      for (let i = 0; i < numInputs; i++) {
        defaultInput.push(generateZeroInput(dimension, windowSize, numChannelsPerInput))
      }
      return defaultInput
    }
  }
  protected getDefaultOutputValueFn({ dimension, windowSize, numOutputChannels }) {
    return function genOutput() {
      return generateZeroInput(dimension, windowSize, numOutputChannels)
    }
  }

  getContext({ channelIndex = ALL_CHANNELS, sampleIndex = undefined } = {}) {
    const inputMemory = this.inputHistory[channelIndex]
    const outputMemory = this.outputHistory[channelIndex]
    return new SignalProcessingContext(
      inputMemory,
      outputMemory,
      {
        windowSize: this.windowSize,
        channelIndex,
        sampleIndex,
        sampleRate: this.sampleRate,
        frameIndex: this.getFrameIndex(),
        currentTime: this.getCurrentTime()
      }
    )
  }
}