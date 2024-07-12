/* Define generic audio-rate utility functions. */

// These utilities are stored here because they are used by the worklet
// which will have no dependencies.
// They are used by both Worklet-based and ScriptProcessorNode-based operations.
export type AudioDimension = "all" | "none" | "channels" | "time"
export type MultiChannelArray<T> = T[] & { get left(): T, get right(): T }
export type AudioFrameContext = { sampleRate: number, currentTime: number, currentFrame: number }

export function toMultiChannelArray<T>(array: T[]): MultiChannelArray<T> {
  const proxy = new Proxy(array, {
    get(target, p, receiver) {
      if (p == "left") return target[0]
      if (p == "right") return target[1]
      return target[p]
    }
  })
  return <MultiChannelArray<T>>proxy
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

function assertValidReturnType(result) {
  if (result === undefined) {
    throw new Error("Expected mapping function to return valid value(s), but got undefined.")
  }
}

function processSamples(
  fn: (...inputs: number[]) => number,
  inputChunks: Float32Array[][],
  outputChunk: Float32Array[]
): number {
  const numChannels = inputChunks[0]?.length
  const numSamples = inputChunks[0][0]?.length
  for (let c = 0; c < numChannels; c++) {
    for (let i = 0; i < numSamples; i++) {
      const inputs = inputChunks.map(input => input[c][i])
      const result = fn(...inputs)
      assertValidReturnType(result)
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
  const numChannels = inputChunks[0]?.length
  for (let c = 0; c < numChannels; c++) {
    const inputs = inputChunks.map(input => input[c])
    const output = fn(...inputs)
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
  outputChunk: Float32Array[]
): number {
  const inputs = inputChunks.map(toMultiChannelArray)
  const result = fn(...inputs)
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
  outputChunk: Float32Array[]
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

export function getProcessingFunction(dimension: AudioDimension): (fn: Function, inputs: Float32Array[][], output: Float32Array[]) => number {
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

/* Serialization */

type SerializedFunction = { fnString: string, dimension: AudioDimension }

export function serializeFunction(
  f: Function,
  dimension: AudioDimension
): SerializedFunction {
  return {
    fnString: f.toString(),
    dimension
  }
}

/********** Worklet-specific code ************/

export const WORKLET_NAME = "function-worklet"

/* Define properties that will be present in the global worklet scope. */

declare const sampleRate: number 
declare const currentTime: number
declare const currentFrame: number

function hasElements(arr: Float32Array[][]) {
  return arr.length && arr[0].length && arr[0][0].length
}

/* Define AudioWorkletProcessor (if in Worklet) */

if (typeof AudioWorkletProcessor != 'undefined') {

  function deserializeFunction(data: SerializedFunction): Function {
    const { fnString, dimension } = data
    const innerFunction = new Function('return ' + fnString)()
    const applyToChunk = getProcessingFunction(dimension)
    return function processFn(
      inputs: Float32Array[][],
      outputs: Float32Array[][],
      __parameters: any
    ) {
      // Bind to current state.
      const context: AudioFrameContext = { sampleRate, currentTime, currentFrame }
      // Apply across dimensions.
      return applyToChunk(innerFunction.bind(context), inputs, outputs[0])
    }
  }

  class OperationWorklet extends AudioWorkletProcessor {
    processImpl: Function
    constructor() {
      super();
      // Receives serialized input sent from postMessage() calls.
      // This is used to change the processing function at runtime.
      this.port.onmessage = (event) => {
        this.processImpl = deserializeFunction(event.data)
      };
    }
    process(inputs, outputs, parameters) {
      this.processImpl && this.processImpl(inputs, outputs, parameters)
      return true
    }
  }

  // Register the AudioWorkletProcessor.
  registerProcessor(WORKLET_NAME, OperationWorklet);
}