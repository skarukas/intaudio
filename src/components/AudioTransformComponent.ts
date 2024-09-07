
import constants from "../shared/constants.js";
// @ts-ignore
import describeFunction from 'function-descriptor';
import { AbstractOutput } from "../io/output/AbstractOutput.js";
import { Connectable } from "../shared/base/Connectable.js";
import { ToStringAndUUID } from "../shared/base/ToStringAndUUID.js";
import { StreamSpec } from "../shared/StreamSpec.js";
import { Disconnect } from "../shared/types.js";
import { createScriptProcessorNode, enumerate, range } from "../shared/util.js";
import { serializeWorkletMessage } from "../worklet/lib/serialization.js";
import { SignalProcessingContextFactory } from "../worklet/lib/SignalProcessingContextFactory.js";
import { AudioDimension } from "../worklet/lib/types.js";
import { MappingFn, getProcessingFunction } from "../worklet/lib/utils.js";
import { FUNCTION_WORKLET_NAME } from "../worklet/OperationWorklet.js";
import { BaseComponent } from "./base/BaseComponent.js";

export abstract class AudioExecutionContext<D extends AudioDimension> extends ToStringAndUUID {
  abstract inputs: AudioNode[]
  abstract outputs: AudioNode[]
  protected applyToChunk: MappingFn<D>

  constructor(public fn: Function, public dimension: D) {
    super()
    this.applyToChunk = getProcessingFunction(dimension)
  }

  protected processAudioFrame(
    inputChunks: Float32Array[][],
    outputChunks: Float32Array[][],
    contextFactory: SignalProcessingContextFactory<D>
  ): number[] {
    return this.applyToChunk(this.fn, inputChunks, outputChunks, contextFactory)
  }

  /**
   * Guess the number of output channels by applying the function to a fake input.
   */
  protected inferNumOutputChannels(
    inputSpec: StreamSpec,
    outputSpec: StreamSpec,
    windowSize: number = 128
  ): number[] {
    const createChunk = (numChannels: number) => range(numChannels).map(
      _ => new Float32Array(windowSize)
    )
    const inputChunks = inputSpec.numChannelsPerStream.map(createChunk)
    // The output may have more channels than the input, so be flexible when 
    // testing it so as to not break the implementation.
    const maxChannelsPerOutput = range(outputSpec.length).fill(constants.MAX_CHANNELS)
    const outputChunks = maxChannelsPerOutput.map(createChunk)
    const contextFactory = new SignalProcessingContextFactory({
      sampleRate: this.audioContext.sampleRate,
      getCurrentTime: () => this.audioContext.currentTime,
      getFrameIndex: () => 0,
      inputSpec,
      outputSpec,
      windowSize,
      dimension: this.dimension
    })
    // The returned value will be the number of new output channels, if it's 
    // different from the provided buffer size, otherwise undefined.
    const numChannelsPerOutput = this.processAudioFrame(inputChunks, outputChunks, contextFactory)
    return numChannelsPerOutput ?? outputSpec.numChannelsPerStream
  }
  static create<D extends AudioDimension>(fn: Function, {
    useWorklet,
    dimension,
    inputSpec,
    outputSpec,
    windowSize,
  }: {
    useWorklet: boolean,
    dimension: D,
    inputSpec: StreamSpec,
    outputSpec: StreamSpec,
    windowSize: number | undefined
  }): AudioExecutionContext<D> {
    if (useWorklet) {
      return new this._.WorkletExecutionContext(fn, {
        dimension,
        inputSpec,
        outputSpec
      })
    } else {
      return new this._.ScriptProcessorExecutionContext(fn, {
        dimension,
        inputSpec,
        outputSpec,
        windowSize,
      })
    }
  }
}

export class WorkletExecutionContext<D extends AudioDimension> extends AudioExecutionContext<D> {
  inputs: AudioNode[];
  outputs: AudioNode[];
  constructor(fn: Function, {
    dimension,
    inputSpec,
    outputSpec
  }: {
    dimension: AudioDimension,
    inputSpec: StreamSpec,
    outputSpec: StreamSpec
  }) {
    super(fn, <any>dimension)
    if (!this.config.state.workletIsAvailable) {
      throw new Error("Can't use worklet for processing because the worklet failed to load. Verify the `workletPath` configuration setting is set correctly and the file is available.")
    }
    // TODO: fix
    if (outputSpec.hasDefaultNumChannels) {
      const numChannelsPerOutput = this.inferNumOutputChannels(inputSpec, outputSpec)
      outputSpec = new StreamSpec({
        ...outputSpec,
        numChannelsPerStream: numChannelsPerOutput
      })
    }

    const worklet = new AudioWorkletNode(this.audioContext, FUNCTION_WORKLET_NAME, {
      numberOfInputs: inputSpec.length,
      outputChannelCount: outputSpec.numChannelsPerStream,
      numberOfOutputs: outputSpec.length
    })
    // TODO: figure this out.
    // @ts-ignore No index signature.
    worklet['__numInputChannels'] = inputSpec.numChannelsPerStream[0]
    // @ts-ignore No index signature.
    worklet['__numOutputChannels'] = outputSpec.numChannelsPerStream[0]

    const { inputs, outputs } = this._.WorkletExecutionContext.defineAudioGraph(worklet, {
      inputSpec,
      outputSpec,
    })
    // NOTE: beginning execution of the user-supplied function must be
    // performed *after* the AudioWorkletNode has all its inputs 
    // connected, otherwise the processor may run process() with an
    // empty input array.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1629478
    const serializedFunction = serializeWorkletMessage(fn, {
      dimension,
      inputSpec,
      outputSpec,
      windowSize: 128  // TODO: make this flexible.
    })
    worklet.port.postMessage(serializedFunction)

    this.inputs = inputs
    this.outputs = outputs
  }
  protected static defineAudioGraph(workletNode: AudioNode, {
    inputSpec,
    outputSpec,
  }: {
    inputSpec: StreamSpec,
    outputSpec: StreamSpec,
  }): { inputs: AudioNode[], outputs: AudioNode[] } {
    const inputNodes = []
    const outputNodes = []
    for (const [i, numChannels] of enumerate(inputSpec.numChannelsPerStream)) {
      const input = new GainNode(this.audioContext, {
        channelCount: numChannels,
        // Force channelCount even if the input has more / fewer channels.
        channelCountMode: "explicit"
      })
      input.connect(workletNode, 0, i)
      inputNodes.push(input)
    }
    for (const [i, numChannels] of enumerate(outputSpec.numChannelsPerStream)) {
      const output = new GainNode(this.audioContext, {
        channelCount: numChannels,
        // Force channelCount even if the input has more / fewer channels.
        channelCountMode: "explicit"
      })
      workletNode.connect(output, i, 0)
      outputNodes.push(output)
    }
    // TODO: implement outputs.
    return { inputs: inputNodes, outputs: outputNodes }
  }
}

export class ScriptProcessorExecutionContext<D extends AudioDimension> extends AudioExecutionContext<D> {
  inputs: AudioNode[];
  outputs: AudioNode[];
  inputSpec: StreamSpec
  outputSpec: StreamSpec
  windowSize: number

  constructor(public fn: Function, {
    dimension,
    inputSpec,
    outputSpec,
    windowSize,
  }: {
    dimension: AudioDimension,
    inputSpec: StreamSpec,
    outputSpec: StreamSpec,
    windowSize?: number,
  }) {
    super(fn, <any>dimension)
    if (inputSpec.totalNumChannels > constants.MAX_CHANNELS) {
      throw new Error(`When using the ScriptProcessorNode, the total number of input channels must be less than ${constants.MAX_CHANNELS}. Given input spec with channelsPerStream=${inputSpec.numChannelsPerStream}.`)
    }
    if (outputSpec.totalNumChannels > constants.MAX_CHANNELS) {
      throw new Error(`When using the ScriptProcessorNode, the total number of output channels must be less than ${constants.MAX_CHANNELS}. Given output spec with channelsPerStream=${outputSpec.numChannelsPerStream}.`)
    }
    if (outputSpec.hasDefaultNumChannels) {
      const numChannelsPerOutput = this.inferNumOutputChannels(inputSpec, outputSpec)
      outputSpec = new StreamSpec({
        ...outputSpec,
        numChannelsPerStream: numChannelsPerOutput
      })
    }
    this.inputSpec = inputSpec
    this.outputSpec = outputSpec

    const processor = createScriptProcessorNode(
      this.audioContext,
      windowSize ?? 0,  // The best value will be chosen if == 0
      inputSpec.totalNumChannels,
      outputSpec.totalNumChannels
    )
    this.windowSize = processor.bufferSize
    const { inputs, outputs } = this._.ScriptProcessorExecutionContext.defineAudioGraph(processor, { inputSpec, outputSpec })
    this.defineAudioProcessHandler(processor)

    this.inputs = inputs
    this.outputs = outputs
  }
  protected static defineAudioGraph(processorNode: AudioNode, {
    inputSpec, outputSpec
  }: {
    inputSpec: StreamSpec,
    outputSpec: StreamSpec,
  }): { inputs: AudioNode[], outputs: AudioNode[] } {
    const inputNodes = []
    const merger = this.audioContext.createChannelMerger(inputSpec.totalNumChannels)
    // Merger -> Processor
    merger.connect(processorNode)
    let startChannel = 0
    for (const numChannels of inputSpec.numChannelsPerStream) {
      const input = new GainNode(
        this.audioContext,
        { channelCount: numChannels }
      )
      // Flattened channel arrangement:
      // [0_left, 0_right, 1_left, 1_right, 2_left, 2_right] 
      for (const j of range(numChannels)) {
        // Input -> Merger
        const destinationChannel = startChannel + j
        // TODO: is this actually connecting the channels properly? It might 
        // just be duplicating the channel across the merger inputs.
        input.connect(merger, 0, destinationChannel)
      }
      startChannel += numChannels
      inputNodes.push(input)
    }
    // TODO: refactor this logic into a general method for expanding / flattening channels.
    const outputNodes = []
    const outputSplitter = this.audioContext.createChannelSplitter(outputSpec.totalNumChannels)
    processorNode.connect(outputSplitter)
    startChannel = 0
    for (const numChannels of outputSpec.numChannelsPerStream) {
      const outputMerger = this.audioContext.createChannelMerger(numChannels)
      for (const j of range(numChannels)) {
        outputSplitter.connect(outputMerger, startChannel + j, j)
      }
      startChannel += numChannels
      outputNodes.push(outputMerger)
    }

    return {
      inputs: inputNodes,
      outputs: outputNodes
    }
  }

  private defineAudioProcessHandler(processor: ScriptProcessorNode) {
    let frameIndex = 0
    const contextFactory = new SignalProcessingContextFactory({
      sampleRate: this.audioContext.sampleRate,
      getCurrentTime: () => this.audioContext.currentTime,
      getFrameIndex: () => frameIndex,
      inputSpec: this.inputSpec,
      outputSpec: this.outputSpec,
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
   * Split out a flattened array of channels into separate inputs/outputs.
   */
  protected groupChannels(
    flatChannels: Float32Array[],
    channelsPerGroup: number[]
  ): Float32Array[][] {
    const groups = []
    let startIndex = 0
    for (let i = 0; i < channelsPerGroup.length; i++) {
      const input = []
      for (let c = 0; c < channelsPerGroup[i]; c++) {
        const flatIndex = startIndex + c
        input.push(flatChannels[flatIndex])
      }
      groups.push(input)
      startIndex += channelsPerGroup[i]
    }
    return groups
  }
  private processAudioEvent(
    event: AudioProcessingEvent,
    contextFactory: SignalProcessingContextFactory<D>
  ): number[] {
    const inputChunk: Float32Array[] = []
    const outputChunk: Float32Array[] = []
    for (let c = 0; c < event.inputBuffer.numberOfChannels; c++) {
      inputChunk.push(event.inputBuffer.getChannelData(c))
    }
    for (let c = 0; c < event.outputBuffer.numberOfChannels; c++) {
      outputChunk.push(event.outputBuffer.getChannelData(c))
    }
    const inputChunks = this.groupChannels(inputChunk, this.inputSpec.numChannelsPerStream)
    const outputChunks = this.groupChannels(outputChunk, this.outputSpec.numChannelsPerStream)
    return this.processAudioFrame(inputChunks, outputChunks, contextFactory)
  }
}

export class AudioTransformComponent<D extends AudioDimension = "none"> extends BaseComponent {
  inputSpec: StreamSpec
  outputSpec: StreamSpec
  // Alias for the first output.
  output: AbstractOutput<any>
  protected executionContext: AudioExecutionContext<D>

  constructor(
    public fn: Function,
    // @ts-ignore Could be initialized with different subtype.
    { dimension = "none",
      windowSize = undefined,
      inputSpec,
      outputSpec,
      useWorklet
    }: {
      dimension?: D,
      windowSize?: number,
      inputSpec?: StreamSpec,
      outputSpec?: StreamSpec,
      useWorklet?: boolean
    } = {}
  ) {
    super()
    // Properties.
    if (inputSpec == undefined) {
      const names = this.inferParamNames(fn)
      inputSpec = new StreamSpec({ names })
    } else if (inputSpec.hasNumberedNames) {
      inputSpec.names = this.inferParamNames(fn, inputSpec)
    }

    outputSpec ??= new StreamSpec({ numStreams: 1 })
    useWorklet ??= this.config.useWorkletByDefault

    // Handles audio graph creation.
    this.executionContext = this._.AudioExecutionContext.create(fn, {
      dimension,
      windowSize,
      inputSpec,
      outputSpec,
      useWorklet,
    })

    // I/O.
    for (const [i, name] of enumerate(inputSpec.names)) {
      const propName = "$" + name
      // @ts-ignore No index signature.
      this[propName] = this.defineAudioInput(
        propName,
        this.executionContext.inputs[i]
      )
      // Numbered alias, only present in .inputs.
      // @ts-ignore No index signature.
      this.defineInputAlias(i, this[propName])
    }
    for (const [i, name] of enumerate(outputSpec.names)) {
      const propName = "$" + name
      // @ts-ignore No index signature.
      this[propName] = this.defineAudioOutput(
        propName,
        this.executionContext.outputs[i]
      )
      // Numbered alias, only present in .outputs
      // @ts-ignore No index signature.
      this.defineOutputAlias(i, this[propName])
    }
    // TODO: this should be automatic, aliases should not count.
    if (inputSpec.length == 1) {
      // @ts-ignore No index signature.
      this.setDefaultInput(this["$" + inputSpec.names[0]])
    }
    if (outputSpec.length == 1) {
      // @ts-ignore No index signature.
      this.setDefaultOutput(this["$" + outputSpec.names[0]])
    }
    this.output = this.defineOutputAlias('output', this.outputs[0])
    this.inputSpec = inputSpec
    this.outputSpec = outputSpec
  }

  private inferParamNames(
    fn: Function,
    inputSpec?: StreamSpec,
  ): (string | number)[] {
    let numInputs = inputSpec?.length
    const maxSafeInputs = Math.floor(constants.MAX_CHANNELS / constants.DEFAULT_NUM_CHANNELS)
    let descriptor;
    try {
      descriptor = describeFunction(fn)
    } catch (e: any) {
      numInputs ??= maxSafeInputs
      console.warn(`Unable to infer the input signature from the given function. Pass inputNames directly in the ${this._className} constructor instead. Defaulting to ${numInputs} inputs, named by their index.\nOriginal error: ${e.message}`)
      return range(numInputs)
    }

    // The node only supports a limited number of channels, so we can only 
    // use the first few.
    if (numInputs == undefined) {
      if (descriptor.maxArgs > maxSafeInputs) {
        console.warn(`Given a function that takes up to ${descriptor.maxArgs} inputs.\nBecause only ${constants.MAX_CHANNELS} channels can be processed by each WebAudio node and each input has ${constants.DEFAULT_NUM_CHANNELS} channels, only values for the first ${maxSafeInputs} inputs will be used. To suppress this warning, pass numInputs directly in the ${this._className} constructor.`)
        numInputs = maxSafeInputs
      } else {
        numInputs = <number>descriptor.maxArgs
      }
    } else if (numInputs < descriptor.minArgs) {
      throw new Error(`Given a function with ${descriptor.minArgs} required parameters, but expected no more than the supplied value of numInputs (${numInputs}) to ensure inputs are not undefined during signal processing.`)
    }
    return range(numInputs).map(i => {
      const paramDescriptor = descriptor.parameters[i]
      // Parameters may be unnamed if they are object- or array-destructured.
      return paramDescriptor?.name || i
    })
  }
  // TODO: turn this into a single array arg here and FunctionComponent
  withInputs(...inputs: Array<Connectable | unknown>): this;
  withInputs(inputDict: { [name: string]: Connectable | unknown }): this;
  override withInputs(...inputs: any): this {
    let inputDict: { [name: string]: Connectable | unknown } = {}
    if (inputs[0]?.connect) {  // instanceof Connectable
      if (inputs.length > this.inputs.length) {
        throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this.inputs.length} but got ${inputs.length}.`)
      }
      for (let i = 0; i < inputs.length; i++) {
        inputDict[i] = inputs[i]
      }
    } else {
      inputDict = inputs[0]
    }
    super.withInputs(inputDict)
    return this
  }
}