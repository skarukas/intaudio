// TODO: split up this file into many modules and generate the worklet file with rollup instead.

/* Define generic audio-rate utility functions. */

// These utilities are stored here because they are used by the worklet
// which will have no dependencies.
// They are used by both Worklet-based and ScriptProcessorNode-based operations.
export type AudioDimension = "all" | "none" | "channels" | "time"
export type MultiChannelArray<T> = T[] & { get left(): T, get right(): T }
export type AudioFrameContext = { sampleRate: number, currentTime: number, currentFrame: number, lastFrame: any }

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


type SignalProcessingFnInput<D> = (
  D extends "all" ? MultiChannelArray<ArrayLike<number>>
  : (
    D extends "channels" ? MultiChannelArray<number>
    : (
      D extends "time" ? ArrayLike<number> : number
    )
  )
)

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

/* Serialization */

type SerializedWorkletMessage = {
  fnString: string,
  dimension: AudioDimension,
  numInputs: number,
  numChannelsPerInput: number,
  numOutputChannels: number,
  windowSize: number
}

export function serializeWorkletMessage(
  f: Function,
  {
    dimension,
    numInputs,
    numChannelsPerInput,
    numOutputChannels,
    windowSize
  }
): SerializedWorkletMessage {
  return {
    fnString: f.toString(),
    dimension,
    numInputs,
    numChannelsPerInput,
    numOutputChannels,
    windowSize
  }
}

/**
 * A data structure storing the last N values in a time series.
 * 
 * It is implemented as a circular array to avoid processing when the time step 
 * is incremented.
 * 
 * Here's a demonstration with eaach t[n] being an absolute time, | showing 
 * the position of the offset, and _ being the default value.
 * 
 * "Initial" state storing the first 4 values:
 * - circularBuffer: [|v3 v2 v1 v0]
 * - offset: 0
 * 
 * > get(0) = v3
 * > get(1) = v2
 * > get(4) = _
 * 
 * After add(v4):
 * - circularBuffer: [v3 v2 v1 | v4]
 * - offset: 3
 * 
 * > get(0) = v4
 * > get(1) = v3
 * 
 * After setSize(8):
 * - circularBuffer: [|v4 v3 v2 v1 _ _ _ _]
 * - offset: 0
 * 
 */
class MemoryBuffer<T> {
  protected circularBuffer: T[] = []
  // offset will always be within range, and circularBuffer[offset] is the 
  // most recent value (circularBuffer[offset+1] is the one before that, etc.)
  protected offset: number = 0

  constructor(public defaultValueFn: (() => T)) { }

  get length(): number {
    return this.circularBuffer.length
  }

  protected toInnerIndex(i: number): number {
    return (i + this.offset) % this.length
  }

  /**
   * Get the ith value of the memory. Note that index 0 is the previous value, not 1.
   */
  get(i: number): T {
    if (i >= this.length) {
      return this.defaultValueFn()
    } else {
      const innerIdx = this.toInnerIndex(i)
      return this.circularBuffer[innerIdx]
    }
  }
  /**
   * Add `val` to the array of memory, incrementing the time step. If `length` is zero, this is a no-op.
   * 
   * NOTE: to add without discarding old values, always call setSize first.
   */
  add(val: T) {
    if (this.length) {
      const clone = JSON.parse(JSON.stringify(val))  // TODO: need this?
      // Modular subtraction by 1.
      this.offset = (this.offset + this.length - 1) % this.length
      this.circularBuffer[this.offset] = clone
    }
  }
  setSize(size: number) {
    const newBuffer = []
    for (let i = 0; i < size; i++) {
      newBuffer.push(this.get(i))
    }
    this.circularBuffer = newBuffer
    this.offset = 0
  }
}

class SignalProcessingContext<D extends AudioDimension> {
  /**
   * The number of samples being processed per second.
   */
  sampleRate: number

  /**
   * The index of the frame, or the number of frames (of size `windowSize`) that elapsed before this frame.
   */
  frameIndex: number

  /**
   * The index of the channel whose data is currently being processed.
   * 
   * Only defined when there is no channel dimension in the data, e.g. when `dimension` is `"time"` or `"none"`.
   */
  channelIndex: number

  /**
   * The index of the sample currently being processed, between 0 and `windowSize -1`.
   * 
   * Only defined when there is no time dimension in the data, e.g. when `dimension` is `"channel"` or `"none"`.
   */
  sampleIndex: number

  /**
   * The length of the audio frame currently being processed.
   * 
   * NOTE: When `dimension` is `"channel"` or `"none"`, each sample is processed separately by the function. In that case, `windowSize`  has no relationship to the input size and is an implementation detail.
   */
  windowSize: number

  /**
   * The AudioContext time at which the processing of this function begins.
   * 
   * When the inputs have a time dimension (if `dimension` is `"time"` or `"all"`), this represents the time of the first sample in the window. Otherwise, this value will be equal to the time at which the current sample is processed.
   */
  currentTime: number

  protected maxInputLookback: number = 0
  protected maxOutputLookback: number = 0
  protected fixedInputLookback: number = undefined
  protected fixedOutputLookback: number = undefined

  constructor(
    protected inputMemory: MemoryBuffer<SignalProcessingFnInput<D>[]>,
    protected outputMemory: MemoryBuffer<SignalProcessingFnInput<D>>,
    {
      windowSize,
      currentTime,
      frameIndex,
      sampleRate,
      channelIndex = undefined,
      sampleIndex = undefined
    }
  ) {
    this.currentTime = currentTime + (sampleIndex / sampleRate)
    this.windowSize = windowSize
    this.sampleIndex = sampleIndex
    this.channelIndex = channelIndex
    this.frameIndex = frameIndex
    this.sampleRate = sampleRate
  }
  previousInputs(t: number = 0): SignalProcessingFnInput<D>[] {
    this.maxInputLookback = Math.max(t + 1, this.maxInputLookback)
    return this.inputMemory.get(t)
  }
  previousOutput(t: number = 0): SignalProcessingFnInput<D> {
    this.maxOutputLookback = Math.max(t + 1, this.maxOutputLookback)
    return this.outputMemory.get(t)
  }
  setOutputMemorySize(n: number) {
    this.fixedOutputLookback = n
  }
  setInputMemorySize(n: number) {
    this.fixedInputLookback = n
  }
  execute(
    fn: Function,
    inputs: SignalProcessingFnInput<D>[]
  ): SignalProcessingFnInput<D> {
    // Execute the function, making the Context properties and methods available
    // within the user-supplied function.
    const output = fn.bind(this)(...inputs)

    // If the function tried to access past inputs or force-rezised the memory, 
    // resize.
    SignalProcessingContext.resizeMemory(this.inputMemory, this.maxInputLookback, this.fixedInputLookback)
    SignalProcessingContext.resizeMemory(this.outputMemory, this.maxOutputLookback, this.fixedOutputLookback)

    // Update memory after resizing.
    this.inputMemory.add(inputs)
    this.outputMemory.add(output)
    return output
  }
  protected static resizeMemory<T>(
    memory: MemoryBuffer<T>,
    maxLookback: number,
    lookbackOverride: number
  ) {
    if (lookbackOverride != undefined) {
      memory.setSize(lookbackOverride)
    } else if (maxLookback > memory.length) {
      memory.setSize(maxLookback)
    }
  }
}

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

/********** Worklet-specific code ************/

export const WORKLET_NAME = "function-worklet"

/* Define properties that will be present in the global worklet scope. */

declare const sampleRate: number
declare const currentTime: number
declare const currentFrame: number

/* Define AudioWorkletProcessor (if in Worklet) */

if (typeof AudioWorkletProcessor != 'undefined') {

  function deserializeWorkletMessage(
    message: SerializedWorkletMessage
  ): Function {
    const innerFunction = new Function('return ' + message.fnString)()
    const applyToChunk = getProcessingFunction(message.dimension)
    const contextFactory = new SignalProcessingContextFactory({
      ...message,
      // Reference global variables.
      sampleRate,
      getCurrentTime: () => currentTime,
      getFrameIndex: () => Math.floor(currentFrame / message.windowSize),
    })
    return function processFn(
      inputs: Float32Array[][],
      outputs: Float32Array[][],
      __parameters: any
    ) {
      // Apply across dimensions.
      applyToChunk(innerFunction, inputs, outputs[0], contextFactory)
    }
  }

  class OperationWorklet extends AudioWorkletProcessor {
    processImpl: Function
    constructor() {
      super();
      // Receives serialized input sent from postMessage() calls.
      // This is used to change the processing function at runtime.
      this.port.onmessage = (event) => {
        this.processImpl = deserializeWorkletMessage(event.data)
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