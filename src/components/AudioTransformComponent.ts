
import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import constants from "../shared/constants.js";
import describeFunction from 'function-descriptor'
import { Disconnect } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
import { createScriptProcessorNode, range } from "../shared/util.js";
import { AudioDimension, MappingFn, SignalProcessingContextFactory, WORKLET_NAME, getProcessingFunction, serializeWorkletMessage } from "../worklet/worklet.js";
import { ToStringAndUUID } from "../shared/base/ToStringAndUUID.js";

function enumValues(Enum: object) {
  const nonNumericKeys = Object.keys(Enum).filter((item) => {
    return isNaN(Number(item));
  });
  return nonNumericKeys.map(k => Enum[k])
}

abstract class AudioExecutionContext<D extends AudioDimension> extends ToStringAndUUID {
  inputs: AudioNode[]
  output: AudioNode
  protected applyToChunk: MappingFn<D>

  constructor(public fn: Function, public dimension: D) {
    super()
    this.applyToChunk = getProcessingFunction(dimension)
  }

  protected processAudioFrame(
    inputChunks: Float32Array[][],
    outputChunk: Float32Array[],
    contextFactory: SignalProcessingContextFactory<D>
  ): number {
    return this.applyToChunk(this.fn, inputChunks, outputChunk, contextFactory)
  }

  /**
   * Guess the number of output channels by applying the function to a fake input.
   */
  protected inferNumOutputChannels(
    numInputs: number,
    numChannelsPerInput: number,
    windowSize: number = 128
  ): number {
    const createChunk = numChannels => range(numChannels).map(
      _ => new Float32Array(windowSize)
    )
    const inputChunks = range(numInputs).map(
      () => createChunk(numChannelsPerInput)
    )
    // The output may have more channels than the input, so be flexible when 
    // testing it so as to not break the implementation.
    const outputChunk = createChunk(constants.MAX_CHANNELS)
    const contextFactory = new SignalProcessingContextFactory({
      sampleRate: this.audioContext.sampleRate,
      getCurrentTime: () => this.audioContext.currentTime,
      getFrameIndex: () => 0,
      numInputs,
      numChannelsPerInput,
      numOutputChannels: constants.MAX_CHANNELS,
      windowSize,
      dimension: this.dimension
    })
    // The returned value will be the number of new output channels, if it's 
    // different from the provided buffer size, otherwise undefined.
    const numOutputChannels = this.processAudioFrame(inputChunks, outputChunk, contextFactory)
    return numOutputChannels ?? numChannelsPerInput
  }
  static create<D extends AudioDimension>(fn: Function, {
    useWorklet,
    dimension,
    numInputs,
    numChannelsPerInput,
    windowSize,
    numOutputChannels
  }: {
    useWorklet: boolean,
    dimension: D,
    numInputs: number,
    numChannelsPerInput: number,
    windowSize: number,
    numOutputChannels: number
  }): AudioExecutionContext<D> {
    if (useWorklet && !this.config.state.workletIsAvailable) {
      throw new Error("Can't use worklet for processing because the worklet failed to load. Verify the `workletPath` configuration setting is set correctly and the file is available.")
    }
    const totalNumChannels = numInputs * numChannelsPerInput
    if (totalNumChannels > constants.MAX_CHANNELS) {
      throw new Error(`The total number of input channels must be less than ${constants.MAX_CHANNELS}. Given numInputs=${numInputs} and numChannelsPerInput=${numChannelsPerInput}.`)
    }
    if (useWorklet) {
      return new WorkletExecutionContext(fn, {
        dimension,
        numInputs,
        numChannelsPerInput,
        numOutputChannels,
      })
    } else {
      return new ScriptProcessorExecutionContext(fn, {
        dimension,
        numInputs,
        numChannelsPerInput,
        windowSize,
        numOutputChannels
      })
    }
  }
}

class WorkletExecutionContext<D extends AudioDimension> extends AudioExecutionContext<D> {
  constructor(fn: Function, {
    dimension,
    numInputs,
    numChannelsPerInput,
    numOutputChannels,
  }) {
    super(fn, dimension)
    numOutputChannels ??= this.inferNumOutputChannels(numInputs, numChannelsPerInput)
    const worklet = new AudioWorkletNode(this.audioContext, WORKLET_NAME, {
      numberOfInputs: numInputs,
      outputChannelCount: [numOutputChannels],
      numberOfOutputs: 1
    })
    worklet['__numInputChannels'] = numChannelsPerInput
    worklet['__numOutputChannels'] = numOutputChannels

    const inputs = WorkletExecutionContext.defineAudioGraph(worklet, {
      numInputs,
      numChannelsPerInput,
    })
    // NOTE: beginning execution of the user-supplied function must be
    // performed *after* the AudioWorkletNode has all its inputs 
    // connected, otherwise the processor may run process() with an
    // empty input array.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1629478
    const serializedFunction = serializeWorkletMessage(fn, {
      dimension,
      numInputs,
      numChannelsPerInput,
      numOutputChannels,
      windowSize: 128
    })
    worklet.port.postMessage(serializedFunction)

    this.inputs = inputs
    this.output = worklet
  }
  protected static defineAudioGraph(workletNode: AudioNode, {
    numInputs,
    numChannelsPerInput,
  }: {
    [k: string]: number
  }): AudioNode[] {
    const inputNodes = []
    for (let i = 0; i < numInputs; i++) {
      const input = new GainNode(this.audioContext, { channelCount: numChannelsPerInput })
      input.connect(workletNode, 0, i)
      inputNodes.push(input)
    }
    return inputNodes
  }
}

class ScriptProcessorExecutionContext<D extends AudioDimension> extends AudioExecutionContext<D> {
  numInputs: number
  numChannelsPerInput: number
  numOutputChannels: number
  windowSize: number

  protected processor: ScriptProcessorNode

  constructor(public fn: Function, {
    dimension,
    numInputs,
    numChannelsPerInput,
    windowSize,
    numOutputChannels
  }) {
    super(fn, dimension)
    numOutputChannels ??= this.inferNumOutputChannels(numInputs, numChannelsPerInput)
    this.numInputs = numInputs
    this.numChannelsPerInput = numChannelsPerInput
    this.numOutputChannels = numOutputChannels
    this.windowSize = windowSize

    const processor = createScriptProcessorNode(
      this.audioContext,
      windowSize,
      numChannelsPerInput * numInputs,
      numOutputChannels
    )
    const inputs = ScriptProcessorExecutionContext.defineAudioGraph(processor, {
      numInputs,
      numChannelsPerInput,
    })
    this.defineAudioProcessHandler(processor)

    this.inputs = inputs
    this.output = processor
  }
  protected static defineAudioGraph(processorNode: AudioNode, {
    numInputs,
    numChannelsPerInput,
  }: {
    [k: string]: number
  }): AudioNode[] {
    const totalNumChannels = numInputs * numChannelsPerInput
    const inputNodes = []
    const merger = this.audioContext.createChannelMerger(totalNumChannels)
    // Merger -> Processor
    merger.connect(processorNode)
    for (let i = 0; i < numInputs; i++) {
      const input = new GainNode(this.audioContext, { channelCount: numChannelsPerInput })
      // Flattened channel arrangement:
      // [0_left, 0_right, 1_left, 1_right, 2_left, 2_right] 
      for (let j = 0; j < numChannelsPerInput; j++) {
        // Input -> Merger
        const destinationChannel = i * numChannelsPerInput + j
        input.connect(merger, 0, destinationChannel)
      }
      inputNodes.push(input)
    }
    return inputNodes
  }

  private defineAudioProcessHandler(processor: ScriptProcessorNode) {
    let frameIndex = 0
    const contextFactory = new SignalProcessingContextFactory({
      sampleRate: this.audioContext.sampleRate,
      getCurrentTime: () => this.audioContext.currentTime,
      getFrameIndex: () => frameIndex,
      numInputs: this.numInputs,
      numChannelsPerInput: this.numChannelsPerInput,
      numOutputChannels: this.numOutputChannels,
      windowSize: this.windowSize,
      dimension: this.dimension
    })
    const handler = (event: AudioProcessingEvent) => {
      try {
        this.processAudioEvent(event, contextFactory)
        frameIndex++
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
    const inputs = []
    for (let i = 0; i < this.numInputs; i++) {
      const input = []
      for (let c = 0; c < this.numChannelsPerInput; c++) {
        const flatIndex = i * this.numChannelsPerInput + c
        input.push(flatInputs[flatIndex])
      }
      inputs.push(input)
    }
    return inputs
  }
  private processAudioEvent(
    event: AudioProcessingEvent,
    contextFactory: SignalProcessingContextFactory<D>
  ): number {
    const inputChunk: Float32Array[] = []
    const outputChunk: Float32Array[] = []
    for (let c = 0; c < event.inputBuffer.numberOfChannels; c++) {
      inputChunk.push(event.inputBuffer.getChannelData(c))
    }
    for (let c = 0; c < event.outputBuffer.numberOfChannels; c++) {
      outputChunk.push(event.outputBuffer.getChannelData(c))
    }
    const inputChunks = this.deinterleaveInputs(inputChunk)
    return this.processAudioFrame(inputChunks, outputChunk, contextFactory)
  }
}

export class AudioTransformComponent extends BaseComponent {
  [idx: number]: AudioRateInput
  readonly output: AudioRateOutput
  numInputs: number
  numChannelsPerInput: number

  constructor(
    public fn: Function,
    { dimension,
      windowSize = undefined,
      inputNames = undefined,
      numInputs = undefined,
      numChannelsPerInput = 2,
      numOutputChannels = undefined,
      useWorklet = false
    }: {
      dimension: AudioDimension,
      windowSize?: number,
      inputNames?: ((string | number))[],
      numInputs?: number,
      numChannelsPerInput?: number,
      numOutputChannels?: number,
      useWorklet?: boolean
    }
  ) {
    super()
    // Properties.
    if (inputNames != undefined) {
      if (numInputs != undefined && numInputs != inputNames.length) {
        throw new Error(`If both numInputs and inputNames are provided, they must match. Given numInputs=${numInputs}, inputNames=[${inputNames}]`)
      }
    } else {
      inputNames = this.inferParamNames(fn, numChannelsPerInput, numInputs)
    }
    numInputs ??= inputNames.length
    this.numInputs = numInputs
    this.numChannelsPerInput = numChannelsPerInput
    // Handles audio graph creation.
    const executionContext = AudioExecutionContext.create(fn, {
      dimension,
      windowSize,
      numInputs,
      numChannelsPerInput,
      numOutputChannels,
      useWorklet,
    })

    // I/O.
    for (const i of range(numInputs)) {
      this[inputNames[i]] = this.defineAudioInput(
        inputNames[i],
        executionContext.inputs[i]
      )
      this[i] = this[inputNames[i]]  // Numbered alias.
    }
    this.output = this.defineAudioOutput('output', executionContext.output)
  }

  private inferParamNames(
    fn: Function,
    numChannelsPerInput: number,
    numInputs?: number,
  ): (string | number)[] {
    const maxSafeInputs = Math.floor(constants.MAX_CHANNELS / numChannelsPerInput)
    let descriptor;
    try {
      descriptor = describeFunction(fn)
    } catch (e) {
      numInputs ??= maxSafeInputs
      console.warn(`Unable to infer the input signature from the given function. Pass inputNames directly in the ${this._className} constructor instead. Defaulting to ${numInputs} inputs, named by their index.\nOriginal error: ${e.message}`)
      return range(numInputs)
    }

    // The node only supports a limited number of channels, so we can only 
    // use the first few.
    if (numInputs == undefined) {
      if (descriptor.maxArgs > maxSafeInputs) {
        console.warn(`Given a function that takes up to ${descriptor.maxArgs} inputs.\nBecause only ${constants.MAX_CHANNELS} channels can be processed by each WebAudio node and each input has ${numChannelsPerInput} channels, only values for the first ${maxSafeInputs} inputs will be used. To suppress this warning, pass numInputs directly in the ${this._className} constructor.`)
        numInputs = maxSafeInputs
      } else {
        numInputs = descriptor.maxArgs
      }
    } else if (numInputs < descriptor.minArgs) {
      throw new Error(`Given a function with ${descriptor.minArgs} required parameters, but expected no more than the supplied value of numInputs (${numInputs}) to ensure inputs are not undefined during signal processing.`)
    }
    return range(numInputs).map(i => {
      const paramDescriptor = descriptor.parameters[i]
      // Parameters may be unnamed if they are object- or array-destructured.
      return paramDescriptor?.name ?? i
    })
  }
}