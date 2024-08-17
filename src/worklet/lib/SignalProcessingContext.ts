import { StreamSpec } from "../../shared/StreamSpec.js"
import { isType } from "../../shared/util.js"
import { FrameToSignatureConverter } from "./FrameToSignatureConverter.js"
import { MemoryBuffer } from "./MemoryBuffer.js"
import { AudioDimension, SignalProcessingFnInput } from "./types.js"

export class SignalProcessingContext<D extends AudioDimension> {
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
  channelIndex: number | undefined

  /**
   * The index of the sample currently being processed, between 0 and `windowSize -1`.
   * 
   * Only defined when there is no time dimension in the data, e.g. when `dimension` is `"channel"` or `"none"`.
   */
  sampleIndex: number | undefined

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

  numInputs: number
  numOutputs: number

  protected maxInputLookback: number = 0
  protected maxOutputLookback: number = 0
  protected fixedInputLookback: number = -1
  protected fixedOutputLookback: number = -1
  protected ioConverter: FrameToSignatureConverter<D>

  constructor(
    protected inputMemory: MemoryBuffer<SignalProcessingFnInput<D>[]>,
    protected outputMemory: MemoryBuffer<SignalProcessingFnInput<D>>,
    {
      windowSize,
      currentTime,
      frameIndex,
      sampleRate,
      ioConverter,
      channelIndex = undefined,
      sampleIndex = undefined
    }: {
      windowSize: number,
      currentTime: number,
      frameIndex: number,
      sampleRate: number,
      ioConverter: FrameToSignatureConverter<D>,
      channelIndex?: number,
      sampleIndex?: number
    }
  ) {
    this.currentTime = currentTime + ((sampleIndex ?? 0) / sampleRate)
    this.windowSize = windowSize
    this.sampleIndex = sampleIndex
    this.channelIndex = channelIndex
    this.frameIndex = frameIndex
    this.sampleRate = sampleRate
    this.numInputs = ioConverter.inputSpec.length
    this.numOutputs = ioConverter.outputSpec.length
    this.ioConverter = ioConverter
  }
  // TODO: consider making this 1-based to make previousInputs(0) be the current.
  previousInputs(t: number = 0): SignalProcessingFnInput<D>[] {
    // Inputs may be float32 which will not represent an int perfectly.
    t = Math.round(t)
    this.maxInputLookback = Math.max(t + 1, this.maxInputLookback)
    return this.inputMemory.get(t)
  }
  previousOutputs(t: number = 0): SignalProcessingFnInput<D> {
    // Inputs may be float32 which will not represent an int perfectly.
    t = Math.round(t)
    this.maxOutputLookback = Math.max(t + 1, this.maxOutputLookback)
    return this.outputMemory.get(t)
  }
  setOutputMemorySize(n: number) {
    // Inputs may be float32 which will not represent an int perfectly.
    n = Math.round(n)
    this.fixedOutputLookback = n
  }
  setInputMemorySize(n: number) {
    // Inputs may be float32 which will not represent an int perfectly.
    n = Math.round(n)
    this.fixedInputLookback = n
  }
  execute(
    fn: Function,
    inputs: SignalProcessingFnInput<D>[]
  ): SignalProcessingFnInput<D>[] {
    // Execute the function, making the Context properties and methods available
    // within the user-supplied function.
    const rawOutput = fn.bind(this)(...inputs)
    const outputs: any = this.ioConverter.normalizeOutputs(rawOutput)

    // If the function tried to access past inputs or force-rezised the memory, 
    // resize.
    SignalProcessingContext.resizeMemory(this.inputMemory, this.maxInputLookback, this.fixedInputLookback)
    SignalProcessingContext.resizeMemory(this.outputMemory, this.maxOutputLookback, this.fixedOutputLookback)

    // Update memory after resizing.
    this.inputMemory.add(inputs)
    this.outputMemory.add(outputs)
    return outputs
  }
  protected static resizeMemory<T>(
    memory: MemoryBuffer<T>,
    maxLookback: number,
    lookbackOverride: number
  ) {
    if (lookbackOverride > 0) {
      memory.setSize(lookbackOverride)
    } else if (maxLookback > memory.length) {
      memory.setSize(maxLookback)
    }
  }
}