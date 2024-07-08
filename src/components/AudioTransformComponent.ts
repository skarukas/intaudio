
import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import constants from "../shared/constants.js";
import { MultiChannelArray, toMultiChannelArray } from "../shared/multichannel.js";
import { Disconnect } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";

export type AudioDimension = "all" | "none" | "channels" | "time"

function enumValues(Enum: object) {
  const nonNumericKeys = Object.keys(Enum).filter((item) => {
    return isNaN(Number(item));
  });
  return nonNumericKeys.map(k => Enum[k])
}



function processSamples(
  fn: (x: number) => number,
  inputChunk: Float32Array[],
  outputChunk: Float32Array[]
): number {
  for (let c = 0; c < inputChunk.length; c++) {
    for (let i = 0; i < inputChunk[c].length; i++) {
      outputChunk[c][i] = fn(inputChunk[c][i])
    }
  }
  return undefined
}


function processTime(
  fn: (samples: Float32Array) => (Float32Array | number[]),
  inputChunk: Float32Array[],
  outputChunk: Float32Array[]
): number {
  for (let c = 0; c < inputChunk.length; c++) {
    // Assume mutation in-place if the function returns undefined.
    const output = fn(inputChunk[c]) ?? inputChunk[c]
    outputChunk[c].set(output)
  }
  return undefined
}

/**
 * Apply a fuction across the audio chunk (channels and time).
 * 
 * @param fn 
 * @param inputChunk 
 * @param outputChunk 
 * @returns The number of channels output by the function.
 */
function processTimeAndChannels(
  fn: (channels: MultiChannelArray<Float32Array>) => (Float32Array | number[])[],
  inputChunk: Float32Array[],
  outputChunk: Float32Array[]
): number {
  const wrapper = toMultiChannelArray(inputChunk)
  const result = fn(wrapper)
  for (let c = 0; c < result.length; c++) {
    if (result[c] == undefined) {
      continue  // This signifies that the channel should be empty.
    }
    outputChunk[c].set(result[c])
  }
  return result.length
}

type ArrayLike<T> = { length: number, [idx: number]: T }

function getColumn<T>(arr: ArrayLike<ArrayLike<T>>, col: number): T[] {
  const result = []
  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i][col])
  }
  return result
}

function writeColumn<T>(arr: ArrayLike<ArrayLike<T>>, col: number, values: T[]) {
  for (let i = 0; i < arr.length; i++) {
    arr[i][col] = values[i]
  }
}

/**
 * Apply a fuction to each sample, across channels.
 * 
 * @param fn 
 * @param inputChunk 
 * @param outputChunk 
 * @returns The number of channels output by the function.
 */
function processChannels(
  fn: (channels: MultiChannelArray<number>) => number[],
  inputChunk: Float32Array[],
  outputChunk: Float32Array[]
): number {
  let numOutputChannels = undefined
  const numSamples = inputChunk[0].length
  for (let i = 0; i < numSamples; i++) {
    const inputChannels = getColumn(inputChunk, i)
    const wrapper = toMultiChannelArray(inputChannels)
    const outputChannels = fn(wrapper).map(v => isFinite(v) ? v : 0)
    writeColumn(outputChunk, i, outputChannels)
    numOutputChannels = outputChannels.length
  }

  return numOutputChannels
}

function getProcessingFunction(dimension: AudioDimension): (fn: Function, input: Float32Array[], output: Float32Array[]) => number {
  switch (dimension) {
    case "all":
      return processTimeAndChannels
    case "channels":
      return processChannels
    case "time":
      return processTime
    case "none":
      return processSamples
    default:
      throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`)
  }
}

export class AudioTransformComponent extends BaseComponent {
  readonly input: AudioRateInput
  readonly output: AudioRateOutput

  protected applyToChunk: (fn: Function, input: Float32Array[], output: Float32Array[]) => number
  protected processor: ScriptProcessorNode

  constructor(
    public fn: Function,
    dimension: AudioDimension,
    windowSize?: number,
    numInputChannels: number = 2
  ) {
    super()
    this.applyToChunk = getProcessingFunction(dimension)
    const numOutputChannels = this.inferNumOutputChannels(numInputChannels, windowSize)
    this.processor = this.audioContext.createScriptProcessor(windowSize, numInputChannels, numOutputChannels)
    // Store true values because the constructor settings are not persisted on 
    // the WebAudio object.
    this.processor['__numInputChannels'] = numInputChannels
    this.processor['__numOutputChannels'] = numOutputChannels

    this.input = this.defineAudioInput('input', this.processor)
    this.output = this.defineAudioOutput('output', this.processor)
    this.defineAudioProcessHandler(this.processor)
  }
  /**
   * Guess the number of output channels by applying the function to a fake input.
   */
  private inferNumOutputChannels(
    numInputChannels: number,
    windowSize: number
  ): number {
    const numSamples = windowSize || 256
    function createChunk(numChannels: number) {
      const shell = Array(numChannels).fill(0)
      return shell.map(() => new Float32Array(numSamples))
    }
    const fillerIn = createChunk(numInputChannels)
    // The output may have more channels than the input, so be flexible when 
    // testing it so as to not break the implementation.
    const fillerOut = createChunk(constants.MAX_CHANNELS)
    // The returned value will be the number of new output channels, if it's 
    // different from the provided buffer size, otherwise undefined.
    const numOutputChannels = this.applyToChunk(this.fn, fillerIn, fillerOut)
    return numOutputChannels ?? numInputChannels
  }
  private defineAudioProcessHandler(processor: ScriptProcessorNode) {
    const handler = (event: AudioProcessingEvent) => {
      try {
        this.processAudioFrame(event.inputBuffer, event.outputBuffer)
      } catch (e) {
        processor.removeEventListener(constants.EVENT_AUDIOPROCESS, handler)
        e instanceof Disconnect || console.error(e)
      }
    }
    processor.addEventListener(constants.EVENT_AUDIOPROCESS, handler)
  }
  private processAudioFrame(
    inputBuffer: AudioBuffer,
    outputBuffer: AudioBuffer
  ) {
    const inputChunk: Float32Array[] = []
    const outputChunk: Float32Array[] = []
    for (let c = 0; c < inputBuffer.numberOfChannels; c++) {
      inputChunk.push(inputBuffer.getChannelData(c))
    }
    for (let c = 0; c < outputBuffer.numberOfChannels; c++) {
      outputChunk.push(outputBuffer.getChannelData(c))
    }
    this.applyToChunk(this.fn, inputChunk, outputChunk)
  }
}