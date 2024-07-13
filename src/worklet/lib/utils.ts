import { SignalProcessingContextFactory } from "./SignalProcessingContextFactory.js"
import { MultiChannelArray, toMultiChannelArray, AudioDimension, SignalProcessingFnInput, ArrayLike } from "./types.js"

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

function assertValidReturnType(result) {
  if (result === undefined) {
    throw new Error("Expected mapping function to return valid value(s), but got undefined.")
  }
}

function processSamples(
  fn: (...inputs: number[]) => number,
  inputChunks: Float32Array[][],
  outputChunk: Float32Array[],
  contextFactory: SignalProcessingContextFactory<"none">
): number {
  const numChannels = inputChunks[0]?.length
  const numSamples = inputChunks[0][0]?.length
  for (let c = 0; c < numChannels; c++) {
    for (let i = 0; i < numSamples; i++) {
      const inputs = inputChunks.map(input => input[c][i])
      const context = contextFactory.getContext({ channelIndex: c, sampleIndex: i })
      const result = context.execute(fn, inputs)
      assertValidReturnType(result)
      outputChunk[c][i] = result
    }
  }
  return undefined
}


function processTime(
  fn: (...inputs: Float32Array[]) => (Float32Array | number[]),
  inputChunks: Float32Array[][],
  outputChunk: Float32Array[],
  contextFactory: SignalProcessingContextFactory<"time">
): number {
  const numChannels = inputChunks[0]?.length
  for (let c = 0; c < numChannels; c++) {
    const inputs = inputChunks.map(input => input[c])
    const context = contextFactory.getContext({ channelIndex: c })
    const output = context.execute(fn, inputs)
    assertValidReturnType(output)
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
  outputChunk: Float32Array[],
  contextFactory: SignalProcessingContextFactory<"all">
): number {
  const inputs = inputChunks.map(toMultiChannelArray)
  const context = contextFactory.getContext()
  const result = context.execute(fn, inputs)
  assertValidReturnType(result)
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
  outputChunk: Float32Array[],
  contextFactory: SignalProcessingContextFactory<"channels">
): number {
  let numOutputChannels;
  const numSamples = inputChunks[0][0]?.length
  for (let i = 0; i < numSamples; i++) {
    // Get the i'th sample, across all channels and inputs.
    const inputs = inputChunks.map(input => {
      const inputChannels = getColumn(input, i)
      return toMultiChannelArray(inputChannels)
    })
    const outputChannels = fn(...inputs).map(v => isFinite(v) ? v : 0)
    assertValidReturnType(outputChannels)
    writeColumn(outputChunk, i, outputChannels)
    numOutputChannels = outputChannels.length
  }

  return numOutputChannels
}
export type MappingFn<D extends AudioDimension> = (
  fn: Function,
  inputs: Float32Array[][],
  output: Float32Array[],
  contextFactory: SignalProcessingContextFactory<D>
) => number

export function getProcessingFunction<D extends AudioDimension>(
  dimension: D
): MappingFn<D> {
  switch (dimension) {
    case "all":
      return processTimeAndChannels as (MappingFn<D>)
    case "channels":
      return processChannels as (MappingFn<D>)
    case "time":
      return processTime as (MappingFn<D>)
    case "none":
      return processSamples as (MappingFn<D>)
    default:
      throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`)
  }
}

/**
 * Returns a structure filled with zeroes that represents the shape of a single input or the output.
 */
export function generateZeroInput<D extends AudioDimension>(
  dimension: D,
  windowSize: number,
  numChannels: number,
): SignalProcessingFnInput<D> {
  switch (dimension) {
    case "all":
      const frame = []
      for (let i = 0; i < numChannels; i++) {
        frame.push(new Float32Array(windowSize))
      }
      return toMultiChannelArray(frame) as (SignalProcessingFnInput<D>)
    case "channels":
      const channels = Array(windowSize).fill(0)
      return toMultiChannelArray(channels) as (SignalProcessingFnInput<D>)
    case "time":
      return <any>new Float32Array(windowSize) as (SignalProcessingFnInput<D>)
    case "none":
      return 0 as (SignalProcessingFnInput<D>)
    default:
      throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`)
  }
}