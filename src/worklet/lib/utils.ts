import { SignalProcessingContextFactory } from "./SignalProcessingContextFactory.js"
import { MultiChannelArray, toMultiChannelArray, AudioDimension, SignalProcessingFnInput, ArrayLike } from "./types.js"

export const IS_WORKLET = typeof AudioWorkletProcessor != 'undefined'

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
    const context = contextFactory.getContext({ sampleIndex: i })
    const outputChannels = context.execute(
      (...inputs: any[]) => fn(...inputs).map(v => isFinite(v) ? v : 0),
      inputs)
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

/**
 * Computes x mod y.
 */
export function mod(x: number, y: number) {
  return ((x % y) + y) % y
}

function sum(arr: Array<number>) {
  return arr.reduce((a, b) => a + b, 0)
}

/* Safe version of TypedArray.set that doesn't throw RangeError. */
function safeArraySet(dest: any, source: any, offset: number) {
  if (source.length + offset > dest.length) {
    for (let i = 0; i + offset < dest.length; i++) {
      dest[i + offset] = source[i]
    }
  } else {
    dest.set(source, offset)
  }
}

export function joinTypedArrays<T extends ArrayLike<any>>(
  buffers: T[],
  ArrayType: any = Float32Array,
  maxLength: number = Infinity
) {
  const lengths = buffers.map(a => a.length)
  const outSize = Math.min(maxLength, sum(lengths))
  const result = new ArrayType(outSize)
  let currOffset = 0
  for (let i = 0; i < buffers.length; i++) {
    if (currOffset >= outSize) break
    safeArraySet(result, buffers[i], currOffset)
    currOffset += lengths[i]
  }
  return result;
}

export function toComplexArray(
  real: Float32Array,
  imaginary: Float32Array,
  complexOut?: Array<number>
): Array<number> {
  complexOut ??= Array(real.length * 2).fill(0)
  for (let i = 0; i < real.length; i++) {
    complexOut[i * 2] = real[i]
    imaginary && (complexOut[i * 2 + 1] = imaginary[i])
  }
  return complexOut
}

export function splitComplexArray(
  complexArray: Array<number>,
  outReal?: Float32Array,
  outImaginary?: Float32Array
): { real: Float32Array, imaginary: Float32Array } {
  const fftSize = complexArray.length / 2
  outReal ??= new Float32Array(fftSize)
  outImaginary ??= new Float32Array(fftSize)
  for (let i = 0; i < fftSize; i++) {
    outReal[i] = complexArray[i * 2]
    outImaginary[i] = complexArray[i * 2 + 1]
  }
  return { real: outReal, imaginary: outImaginary }
}

export function carToPol(
  real: number, imag: number
): { magnitude: number, phase: number } {
  return {
    magnitude: Math.sqrt(real * real + imag * imag),
    // Math.atan(imag / real) leads to non-invertible polar coordinates.
    phase: Math.atan2(imag, real)
  }
}

export function carToPolArray(
  real: ArrayLike<number>,
  imag: ArrayLike<number>,
  magnitude?: ArrayLike<number>,
  phase?: ArrayLike<number>
): { magnitude: ArrayLike<number>, phase: ArrayLike<number> } {
  magnitude ??= new Float32Array(real.length)
  phase ??= new Float32Array(real.length)
  for (let i = 0; i < real.length; i++) {
    const polar = carToPol(real[i], imag[i])
    magnitude[i] = polar.magnitude
    phase[i] = polar.phase
  }
  return { magnitude, phase }
}

export function polToCar(
  magnitude: number, phase: number
): { real: number, imaginary: number } {
  return {
    real: magnitude * Math.cos(phase),
    imaginary: magnitude * Math.sin(phase)
  }
}

export function polToCarArray(
  magnitude: Float32Array,
  phase: Float32Array,
  real?: Float32Array,
  imaginary?: Float32Array
): { real: Float32Array, imaginary: Float32Array } {
  real ??= new Float32Array(magnitude.length)
  imaginary ??= new Float32Array(magnitude.length)
  for (let i = 0; i < real.length; i++) {
    const cartesian = polToCar(magnitude[i], phase[i])
    real[i] = cartesian.real
    imaginary[i] = cartesian.imaginary
  }
  return { real, imaginary }
}

export function getChannel(arr: Float32Array[], c: number) {
  return arr[c % arr.length]
}

export function map2d<T, V>(
  grid: Array<Array<T>>,
  fn: (v: T, i?: number, j?: number) => V
): Array<Array<V>> {
  return grid.map((arr, i) => arr.map((v, j) => fn(v, i, j)))
}