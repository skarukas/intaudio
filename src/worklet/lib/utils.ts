import { KeysLike, ObjectOf, ObjectOrArrayOf } from "../../shared/types.js"
import { enumerate, isType, zip } from "../../shared/util.js"
import { IODatatype } from "./FrameToSignatureConverter.js"
import { SignalProcessingContextFactory } from "./SignalProcessingContextFactory.js"
import { MultiChannelArray, toMultiChannelArray, AudioDimension, SignalProcessingFnInput, ArrayLike } from "./types.js"
import { WritableArrayLike } from "./views.js"

export const IS_WORKLET = typeof AudioWorkletProcessor != 'undefined'

function getColumn<T>(arr: ArrayLike<ArrayLike<T>>, col: number): T[] {
  const result = []
  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i][col])
  }
  return result
}

function writeColumn<T>(
  arr: ArrayLike<ArrayLike<T>>,
  col: number,
  values: ArrayLike<T>
) {
  for (let i = 0; i < arr.length; i++) {
    arr[i][col] = values[i]
  }
}

function assertValidReturnType(result: any) {
  if (result === undefined) {
    throw new Error("Expected mapping function to return valid value(s), but got undefined.")
  }
}

function processSamples(
  fn: (...inputs: number[]) => number[],
  inputChunks: Float32Array[][],
  outputChunks: Float32Array[][],
  contextFactory: SignalProcessingContextFactory<"none">
): number[] {
  const numChannels = inputChunks[0]?.length
  const numSamples = inputChunks[0][0]?.length
  for (let c = 0; c < numChannels; c++) {
    for (let i = 0; i < numSamples; i++) {
      const inputs = inputChunks.map(input => input[c][i])
      const context = contextFactory.getContext({ channelIndex: c, sampleIndex: i })
      const outputs = context.execute(fn, inputs)
      for (const [output, dest] of zip(outputs, outputChunks)) {
        assertValidReturnType(output)
        dest[c][i] = output
      }
    }
  }
  // The number of output channels is the same as the input because this is not
  // determined by the user's function.
  return outputChunks.map(_ => numChannels)
}


function processTime(
  fn: (...inputs: Float32Array[]) => (Float32Array | number[])[],
  inputChunks: Float32Array[][],
  outputChunks: Float32Array[][],
  contextFactory: SignalProcessingContextFactory<"time">
): number[] {
  const numChannels = inputChunks[0]?.length
  for (let c = 0; c < numChannels; c++) {
    const inputs = inputChunks.map(input => input[c])
    const context = contextFactory.getContext({ channelIndex: c })
    const outputs = context.execute(fn, inputs)
    for (const [output, dest] of zip(outputs, outputChunks)) {
      assertValidReturnType(output)
      dest[c].set(output)
    }
  }
  // The number of output channels is the same as the input because this is not
  // determined by the user's function.
  return outputChunks.map(_ => numChannels)
}

/**
 * Apply a fuction across the audio chunk (channels and time).
 * 
 * @param fn 
 * @param inputChunks 
 * @param outputChunks 
 * @returns The number of channels for each output of the function.
 */
function processTimeAndChannels(
  fn: (...inputs: MultiChannelArray<Float32Array>[]) => (Float32Array | number[])[][],
  inputChunks: Float32Array[][],
  outputChunks: Float32Array[][],
  contextFactory: SignalProcessingContextFactory<"all">
): number[] {
  const inputs = inputChunks.map(toMultiChannelArray)
  const context = contextFactory.getContext()
  const outputs = context.execute(fn, inputs)
  assertValidReturnType(outputs)
  for (const [output, dest] of zip(outputs, outputChunks)) {
    for (let c = 0; c < output.length; c++) {
      if (output[c] == undefined) {
        continue  // This signifies that the channel should be empty.
      }
      dest[c].set(output[c])
    }
  }
  return outputs.map(a => a.length)
}

/**
 * Apply a fuction to each sample, across channels.
 * 
 * @param fn 
 * @param inputChunks 
 * @param outputChunks 
 * @returns The number of channels for each output of the function.
 */
function processChannels(
  fn: (...inputs: MultiChannelArray<number>[]) => number[][],
  inputChunks: Float32Array[][],
  outputChunks: Float32Array[][],
  contextFactory: SignalProcessingContextFactory<"channels">
): number[] {
  const numOutputChannels = Array(outputChunks.length).fill(0)
  const numSamples = inputChunks[0][0]?.length
  for (let i = 0; i < numSamples; i++) {
    // Get the i'th sample, across all channels and inputs.
    const inputs = inputChunks.map(input => {
      const inputChannels = getColumn(input, i)
      return toMultiChannelArray(inputChannels)
    })
    const context = contextFactory.getContext({ sampleIndex: i })
    const outputChannels = context.execute(fn, inputs)
    for (
      const [j, [output, destChunk]]
      of enumerate(zip(outputChannels, outputChunks))
    ) {
      // TODO: add NaN logic to postprocessing instead.
      writeColumn(destChunk, i, map(output, v => isFinite(v) ? v : 0))
      numOutputChannels[j] = output.length
    }
  }

  return numOutputChannels
}
export type MappingFn<D extends AudioDimension> = (
  fn: Function,
  inputs: Float32Array[][],
  outputs: Float32Array[][],
  contextFactory: SignalProcessingContextFactory<D>
) => number[]

export function getProcessingFunction<D extends AudioDimension>(
  dimension: D
): MappingFn<D> {
  switch (dimension) {
    case "all":
      return <unknown>processTimeAndChannels as (MappingFn<D>)
    case "channels":
      return <unknown>processChannels as (MappingFn<D>)
    case "time":
      return <unknown>processTime as (MappingFn<D>)
    case "none":
      return <unknown>processSamples as (MappingFn<D>)
    default:
      throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`)
  }
}

export function mapOverChannels<D extends AudioDimension, R>(
  dimension: D,
  data: SignalProcessingFnInput<D>,
  fn: (x: ArrayLike<number>) => R
): KeysLike<SignalProcessingFnInput<D>, R> {
  switch (dimension) {
    case "all":
      return <any>map(data as SignalProcessingFnInput<"all">, fn)
    case "channels":
      const channels = <SignalProcessingFnInput<"channels">>data
      return <any>map(channels, c => fn([c]))
    case "time":
      return <any>fn(<SignalProcessingFnInput<"time">>data)
    case "none":
      return <any>fn([<number>data])
    default:
      throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`)
  }
}

// Lightweight check that the structure is correct.
export function isCorrectOutput<D extends AudioDimension>(
  dimension: D,
  output: SignalProcessingFnInput<D>,
  type: IODatatype,
): boolean {
  const typeValidation = type.__NEW__validateAny(output)
  switch (dimension) {
    case "all":
      return typeValidation && isArrayLike(output) && isArrayLike((output as any)[0])
    case "channels":
      // NOTE: Channels can be undefined, a special case that means empty data.
      return output == undefined || typeValidation && isArrayLike(output)
    case "time":
      return typeValidation && isArrayLike(output)
    case "none":
      return typeValidation
    default:
      throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`)
  }
}

function propertyIsDefined(obj: unknown, property: string | number) {
  return typeof obj === 'object'
    && obj !== null
    && property in obj
    && (<any>obj)[property] != undefined
}

export function isArrayLike(value: unknown) {
  return isType(value, Array) || propertyIsDefined(value, 'length') && propertyIsDefined(value, 0)
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
      return <any>toMultiChannelArray(frame) as (SignalProcessingFnInput<D>)
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

export function sum(iter: Iterable<number>): number {
  let sm = 0
  for (const x of iter) {
    sm += x
  }
  return sm
}

const _NO_VALUE = Symbol("_NO_VALUE")

export function allEqual(iter: Iterable<any>): boolean {
  let lastValue: any = _NO_VALUE
  for (const x of iter) {
    if (lastValue != _NO_VALUE && lastValue != x) {
      return false
    }
    lastValue = x
  }
  return true
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
  real: ArrayLike<number>,
  imaginary: ArrayLike<number>,
  complexOut?: ArrayLike<number>
): ArrayLike<number> {
  complexOut ??= Array(real.length * 2).fill(0)
  for (let i = 0; i < real.length; i++) {
    complexOut[i * 2] = real[i]
    imaginary && (complexOut[i * 2 + 1] = imaginary[i])
  }
  return complexOut
}

export function splitComplexArray<T>(
  complexArray: ArrayLike<number>,
  outReal?: ArrayLike<any>,
  outImaginary?: ArrayLike<any>
): { real: ArrayLike<any>, imaginary: ArrayLike<any> } {
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
  magnitude: ArrayLike<number>,
  phase: ArrayLike<number>,
  real?: WritableArrayLike<number>,
  imaginary?: WritableArrayLike<number>
): { real: WritableArrayLike<number>, imaginary: WritableArrayLike<number> } {
  real ??= new Float32Array(magnitude.length)
  imaginary ??= new Float32Array(magnitude.length)
  for (let i = 0; i < real.length; i++) {
    const cartesian = polToCar(magnitude[i], phase[i])
    real[i] = cartesian.real
    imaginary[i] = cartesian.imaginary
  }
  return { real, imaginary }
}

export function getChannel<ArrType extends ArrayLike<any>>(
  arr: ArrayLike<ArrType>, c: number
): ArrType {
  return arr[c % arr.length]
}

export function map<T, R>(
  obj: ArrayLike<T>,
  fn: (v: T, i: number) => R
): R[]
export function map<T, R>(
  obj: ObjectOf<T>,
  fn: (v: T, i: number | string) => R
): ObjectOf<R>
export function map<T, R>(
  obj: ArrayLike<T> | ObjectOf<T>,
  fn: (v: T, i: any) => R
): ObjectOrArrayOf<R> {
  if (isArrayLike(obj)) {
    return Array.prototype.map.call(obj, fn) as R[]
  } else {
    const res: ObjectOf<R> = {}
    Object.entries(obj as ObjectOf<T>).forEach(([key, value]) => {
      const result = fn(value, key)
      result != undefined && (res[key] = result)
    })
    return res
  }
}

export function map2d<T, V>(
  grid: Array<Array<T>>,
  fn: (v: T, i: number, j: number) => V
): Array<Array<V>> {
  return grid.map((arr, i) => arr.map((v, j) => fn(v, i, j)))
}

export const SafeAudioWorkletProcessor = IS_WORKLET ? AudioWorkletProcessor : class AudioWorkletProcessor {
  port: MessagePort
  outPort: MessagePort
  constructor() {
    const channel = new MessageChannel()
    this.port = channel.port1
    this.outPort = channel.port2
  }
}