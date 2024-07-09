
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

function assertValidReturnType(fn, result) {
  if (result === undefined) {
    throw new Error("Expected mapping function to return valid value(s), but got undefined.")
  }
}

function processSamples(
  fn: (...inputs: number[]) => number,
  inputChunks: Float32Array[][],
  outputChunk: Float32Array[]
): number {
  const numChannels = inputChunks[0].length
  const numSamples = inputChunks[0][0].length
  for (let c = 0; c < numChannels; c++) {
    for (let i = 0; i < numSamples; i++) {
      const inputs = inputChunks.map(input => input[c][i])
      const result = fn(...inputs)
      assertValidReturnType(fn, result)
      outputChunk[c][i] = result
    }
  }
  return undefined
}


function processTime(
  fn: (...inputs: Float32Array[]) => (Float32Array | number[]),
  inputChunks: Float32Array[][],
  outputChunk: Float32Array[]
): number {
  const numChannels = inputChunks[0].length
  for (let c = 0; c < numChannels; c++) {
    const inputs = inputChunks.map(input => input[c])
    const output = fn(...inputs)
    assertValidReturnType(fn, output)
    outputChunk[c].set(output)
  }
  return undefined
}

/**
 * Apply a fuction across the audio chunk (channels and time).
 * 
 * @param fn 
 * @param inputChunks 
 * @param outputChunk 
 * @returns The number of channels output by the function.
 */
function processTimeAndChannels(
  fn: (...inputs: MultiChannelArray<Float32Array>[]) => (Float32Array | number[])[],
  inputChunks: Float32Array[][],
  outputChunk: Float32Array[]
): number {
  const inputs = inputChunks.map(toMultiChannelArray)
  const result = fn(...inputs)
  assertValidReturnType(fn, result)
  for (let c = 0; c < result.length; c++) {
    if (result[c] == undefined) {
      continue  // This signifies that the channel should be empty.
    }
    outputChunk[c].set(result[c])
  }
  return result.length
}

/**
 * Apply a fuction to each sample, across channels.
 * 
 * @param fn 
 * @param inputChunks 
 * @param outputChunk 
 * @returns The number of channels output by the function.
 */
function processChannels(
  fn: (...inputs: MultiChannelArray<number>[]) => number[],
  inputChunks: Float32Array[][],
  outputChunk: Float32Array[]
): number {
  let numOutputChannels;
  const numSamples = inputChunks[0][0].length
  for (let i = 0; i < numSamples; i++) {
    // Get the i'th sample, across all channels and inputs.
    const inputs = inputChunks.map(input => {
      const inputChannels = getColumn(input, i)
      return toMultiChannelArray(inputChannels)
    })
    const outputChannels = fn(...inputs).map(v => isFinite(v) ? v : 0)
    assertValidReturnType(fn, outputChannels)
    writeColumn(outputChunk, i, outputChannels)
    numOutputChannels = outputChannels.length
  }

  return numOutputChannels
}

function getProcessingFunction(dimension: AudioDimension): (fn: Function, inputs: Float32Array[][], output: Float32Array[]) => number {
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

  protected applyToChunk: (fn: Function, inputs: Float32Array[][], output: Float32Array[]) => number
  protected processor: ScriptProcessorNode

  constructor(
    public fn: Function,
    { dimension,
      windowSize = undefined,
      numChannelsPerInput = 2,
      numOutputChannels = undefined
    }: {
      dimension: AudioDimension,
      windowSize?: number,
      numChannelsPerInput: number,
      numOutputChannels?: number
    }
  ) {
    super()
    this.applyToChunk = getProcessingFunction(dimension)
    numOutputChannels ??= this.inferNumOutputChannels(numChannelsPerInput, windowSize)
    this.processor = this.audioContext.createScriptProcessor(windowSize, numChannelsPerInput, numOutputChannels)
    // Store true values because the constructor settings are not persisted on 
    // the WebAudio object.
    this.processor['__numInputChannels'] = numChannelsPerInput
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
    const sampleRate = this.audioContext.sampleRate
    function createBuffer(numberOfChannels: number) {
      return new AudioBuffer({
        length: windowSize || 256,
        numberOfChannels,
        sampleRate
      })
    }
    const inputBuffer = createBuffer(numInputChannels)
    // The output may have more channels than the input, so be flexible when 
    // testing it so as to not break the implementation.
    const outputBuffer = createBuffer(constants.MAX_CHANNELS)
    const fillerEvet = new AudioProcessingEvent(constants.EVENT_AUDIOPROCESS, {
      playbackTime: 0,
      inputBuffer,
      outputBuffer
    })
    // The returned value will be the number of new output channels, if it's 
    // different from the provided buffer size, otherwise undefined.
    const numOutputChannels = this.processAudioFrame(fillerEvet)
    return numOutputChannels ?? numInputChannels
  }
  private defineAudioProcessHandler(processor: ScriptProcessorNode) {
    const handler = (event: AudioProcessingEvent) => {
      try {
        this.processAudioFrame(event)
      } catch (e) {
        processor.removeEventListener(constants.EVENT_AUDIOPROCESS, handler)
        e instanceof Disconnect || console.error(e)
      }
    }
    processor.addEventListener(constants.EVENT_AUDIOPROCESS, handler)
  }
  /**
   * Split out a flattened array of channels into separate inputs.
   */
  protected deinterleaveInputs(flatInputs: Float32Array[]): Float32Array[][] {
    return [flatInputs]  // TODO: implement for multi-input case.
  }
  private processAudioFrame(event: AudioProcessingEvent): number {
    const inputChunk: Float32Array[] = []
    const outputChunk: Float32Array[] = []
    for (let c = 0; c < event.inputBuffer.numberOfChannels; c++) {
      inputChunk.push(event.inputBuffer.getChannelData(c))
    }
    for (let c = 0; c < event.outputBuffer.numberOfChannels; c++) {
      outputChunk.push(event.outputBuffer.getChannelData(c))
    }
    const inputChunks = this.deinterleaveInputs(inputChunk)
    return this.applyToChunk(this.fn.bind(event), inputChunks, outputChunk)
  }
}