import { Queue } from '@datastructures-js/queue';
import { map2d, SafeAudioWorkletProcessor } from "./utils.js";
import { ArrayView, WritableArrayLike } from "./views.js";

/**
 * A Queue that allows adding and popping many elements at a time, without copying the underlying data.
 */
class ChunkedQueue<T> {
  protected queue: Queue<WritableArrayLike<T>> = new Queue()
  /**
   * Records how far into this.queue.front() we've already read.
   */
  protected numElementsAlreadyRead: number = 0
  length: number = 0

  protected getChunk(numElements: number, defaultValue?: T, removeItems?: boolean): ArrayView<T> {
    let numPoppedElements = 0
    let lengthAfterPop = this.length
    let numElementsRead = this.numElementsAlreadyRead
    const queue = removeItems ? this.queue : this.queue.clone()
    const arrsToConcat: WritableArrayLike<T>[] = []

    while (numPoppedElements < numElements) {
      let arr = queue.front()
      if (arr == undefined) {
        // Fill rest with default value.
        arrsToConcat.push(Array(numElements - numPoppedElements).fill(defaultValue))
        break
      }
      if (numElementsRead) {
        // Only look after the ones that have been read.
        arr = ArrayView.createSliceView(arr, numElementsRead)
      }

      numPoppedElements += arr.length

      if (numPoppedElements <= numElements) {
        // Safe to remove, as we used up all the elements in the array.
        queue.pop()
        numElementsRead = 0
      } else {
        // We don't need to use the whole array. Only look at first (oldest) 
        // values and keep the array around.
        const numUnused = numPoppedElements - numElements
        numElementsRead += (arr.length - numUnused)
        arr = ArrayView.createSliceView(arr, 0, arr.length - numUnused)
      }
      arrsToConcat.push(arr)
      lengthAfterPop -= arr.length
    }
    if (removeItems) {
      this.numElementsAlreadyRead = numElementsRead
      this.length = lengthAfterPop
    }

    return ArrayView.createConcatView(...arrsToConcat)
  }
  popChunk(numElements: number, defaultValue?: T): ArrayView<T> {
    return this.getChunk(numElements, defaultValue, true)
  }
  peekChunk(numElements: number, defaultValue?: T): ArrayView<T> {
    return this.getChunk(numElements, defaultValue, false)
  }
  addChunk(arr: WritableArrayLike<T>) {
    this.queue.push(arr)
    this.length += arr.length
  }
}

/**
 * A class that abstracts out the size of actual window received, ensuring all windows have a specific size.
 */
class AudioStreamScheduler {
  // TODO: consider allocating inputQueues and outputQueues beforehand and 
  // relying on the numChannelsPerOutput property.
  constructor(
    public windowSize: number,
    public numInputs: number,
    public numOutputs: number,
    public processWindow: (i: ArrayLike<number>[][], o: ArrayLike<number>[][]) => boolean | void,
    public getChunkStartIndex: (chunk: ArrayView<number>[][]) => number = () => 0
  ) { }
  // Indexed by [input, channel, timeInThePast, localTime]
  // These are only definitely defined from the point of view of the caller, as 
  // the caller can only access process(), in which they'll be initialized.
  inputQueues!: ChunkedQueue<number>[][]
  outputQueues!: ChunkedQueue<number>[][]

  private get inputQueueSize(): number {
    return this.inputQueues[0][0].length
  }

  private popInputChunk(size: number): ArrayView<number>[][] {
    return map2d(this.inputQueues, queue => queue.popChunk(size, 0))
  }
  private peekInputChunk(size: number): ArrayView<number>[][] {
    return map2d(this.inputQueues, queue => queue.peekChunk(size, 0))
  }
  private popOutputChunk(size: number): ArrayView<number>[][] {
    return map2d(this.outputQueues, queue => queue.popChunk(size, 0))
  }
  private addToOutputQueue(outputs: WritableArrayLike<number>[][]) {
    map2d(this.outputQueues, (queue, i, c) => queue.addChunk(outputs[i][c]))
  }
  private addToInputQueue(inputs: WritableArrayLike<number>[][]) {
    map2d(this.inputQueues, (queue, i, c) => queue.addChunk(inputs[i][c]))
  }
  private *getScheduledInputBatches(): Generator<ArrayView<number>[][]> {
    // Process all the data we can.
    while (this.inputQueueSize >= this.windowSize) {
      const inputChunk = this.peekInputChunk(this.windowSize)
      const startIndex = this.getChunkStartIndex(inputChunk)
      if (startIndex) {
        // Pop all elements before it. The next loop will start there.
        this.popInputChunk(startIndex)
      } else if (startIndex == -1) {
        this.popInputChunk(this.windowSize)
      } else {
        yield this.popInputChunk(this.windowSize)
      }
    }
  }
  private processScheduledBatches(): boolean {
    let keepAlive: boolean | undefined
    for (const inputBatch of this.getScheduledInputBatches()) {
      const numChannels = inputBatch[0].length

      // Each input batch is of length this.windowSize
      const outputs = []
      for (let i = 0; i < this.numOutputs; i++) {
        const output = []
        for (let c = 0; c < numChannels; c++) {
          output.push(new Float32Array(inputBatch[0][0].length))
        }
        outputs.push(output)
      }
      // If any want to keep-alive, keep alive.
      keepAlive ??= false
      const res = <boolean>this.processWindow(<any>map2d(inputBatch, v => v.toArray()), outputs)
      keepAlive ||= res
      this.addToOutputQueue(outputs)
    }
    // If no batches were yet scheduled (keepAlive==undefined), keep alive.
    return keepAlive ?? true
  }
  private copyToOutputs(
    queuedOutputs: ArrayView<number>[][],
    outputs: Float32Array[][]
  ) {
    for (let i = 0; i < outputs.length; i++) {
      for (let c = 0; c < outputs[i].length; c++) {
        outputs[i][c].set(queuedOutputs[i][c])
      }
    }
  }
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
  ): boolean {

    // TODO: fill in dummy values if given input = []
    if (!(
      inputs.length && inputs.every(i => i.length) && outputs.length && outputs.every(i => i.length)
    )) {
      // TODO: how do we handle "input-based" scheduling if there are zero 
      // inputs?
      console.error("0-input and 0-channel functions are not supported yet. This frame will be ignored.")
      return true
    }
    //if (inputs.length == 3) console.log(["inputs", ...inputs[0][0]])
    // If arrays are overwritten by WebAudio API, we need to copy. 
    // TODO: maybe remove.
    // Initalize queues (only happens once).
    this.inputQueues ??= map2d(inputs, _ => new ChunkedQueue())
    this.outputQueues ??= map2d(outputs, _ => new ChunkedQueue())

    // Add input to input queue.
    this.addToInputQueue(inputs)

    // Process output if needed and add the result to the output queue.
    this.processScheduledBatches()

    // Pop output from output queue.
    const queuedOutputs = this.popOutputChunk(inputs[0][0].length)
    //console.log(queuedOutputs[0][0][0])
    /* if (queuedOutputs[0][0][0] == 768) {
      throw new Error("" + queuedOutputs[0][0][0])
    } */

    // Write to current outputs.
    this.copyToOutputs(queuedOutputs, outputs)

    //if (outputs.length == 3) console.log(["outputs", ...outputs[0][0]])
    //
    //console.log(["inputs", inputs[0][0]])
    return true
  }
}

/**
 * Uses input / output queuing to abstract sequence length away from the size of arrays passed to process().
 */
export class BaseWorkletProcessor extends SafeAudioWorkletProcessor {
  scheduler: AudioStreamScheduler

  constructor(
    public windowSize: number,
    public numInputs: number,
    public numOutputs: number
  ) {
    super()
    if (this.numInputs == 0) {
      throw new RangeError("0-input worklets are not supported yet.")
    }
    if (this.constructor.prototype.process != BaseWorkletProcessor.prototype.process) {
      throw new Error("The process() method must not be overridden. Overwrite processWindow() instead.")
    }
    this.scheduler = new AudioStreamScheduler(
      windowSize,
      numInputs,
      numOutputs,
      this.processWindow.bind(this),
      this.getInputChunkStartIndex.bind(this)
    )
  }
  /**
   * Abstract method that receives chunks of size this.windowSize.
   */
  processWindow(
    inputs: ArrayLike<number>[][],
    outputs: ArrayLike<number>[][]
  ) {
    throw new Error("Not implemented.")
  }
  /**
   * This determines the index in the chunk at which to start the batch, and should be overridden by the subclass.
   * 
   * This is mainly useful in situations where a specific chunk of data is required for the operation, such as magnitude values from 0 to 1023 in an FFT with a window size of 1024. If this method did not exist, an FFT frame could contain values like `[896 through 1023, 0 through 895]`, which should actually be processed as two separate frames--e.g. it should be delayed by 128 samples to process the frame starting from 0.
   * 
   * Elements before this index will be discarded, and the batch will not be popped until it is full size. A return value of -1 indicates that the entire chunk should be discarded.
   */
  getInputChunkStartIndex(chunk: ArrayView<number>[][]): number {
    return 0
  }
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: any  // TODO: handle parameters?
  ): boolean {
    /* const numChannels = Math.max(
      ...inputs.map(v => v.length),
      ...outputs.map(v => v.length)
    ) */
    try {
      const numChannels = Math.max(...inputs.map(input => input.length))
      const numSamples = Math.max(...inputs.map(input => input[0]?.length))
      // Fill in empty ("disconnected" inputs).
      inputs = inputs.map((input, i) => {
        if (input.length) {
          // Make a *copy*. This is necessary because the Web Audio API reuses
          // input buffers between process() calls so otherwise the data will be
          // overwritten.
          return input.map(c => new Float32Array(c))
        }
        const emptyChannels = Array(numChannels).fill([])
        return emptyChannels.map(_ => new Float32Array(numSamples))
      })
      return this.scheduler.process(inputs, outputs)
    } catch (e) {
      console.error(`Encountered worklet error while processing the following input frame:`)
      console.error(inputs)
      throw e
    }
  }
}

/* 
const scheduler = new AudioStreamScheduler(1024, 1, 3, (inputs, outputs) => {
  map2d(outputs, arr => arr.map((v, k) => arr[k] = inputs[0][0][k]))
  console.log(["true!", outputs])
})

const inputs = [[new Float32Array(128)]]
for (let i = 0; i < 128; i++) {
  map2d(inputs, arr => arr.map((_, i) => arr[i] = Math.random()))
  const outputs = [[new Float32Array(128)], [new Float32Array(128)], [new Float32Array(128)]]
  scheduler.process(inputs, outputs)
  console.log(outputs)
}

scheduler.process([[new Float32Array([10, 11, 12, 13])]], [[new Float32Array(4)]]) 
scheduler.process([[new Float32Array([14])]], [[new Float32Array(1)]])
scheduler.process([[new Float32Array([15])]], [[new Float32Array(1)]])
scheduler.process([[new Float32Array([16, 17])]], [[new Float32Array(2)]])
scheduler.process([[]], [[new Float32Array([18, 19, 20, 21, 22])]]) */ 