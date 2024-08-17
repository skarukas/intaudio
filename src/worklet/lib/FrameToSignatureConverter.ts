import { TypedStreamSpec } from "../../shared/StreamSpec.js"
import { KeysLike, ObjectOf } from "../../shared/types.js"
import { enumerate, isType, range, zip } from "../../shared/util.js"
import { ArrayLike, AudioDimension, MultiChannelArray, SignalProcessingFnInput, toMultiChannelArray } from "./types.js"
import { isArrayLike, isCorrectOutput, map, mapOverChannels } from "./utils.js"
import { ArrayView } from "./views.js"

// A frame represents the raw audio data of a single channel of data of the 
// given type. This may include multiple "true" channels, such as with STFT 
// magnitude and phase.
type RawChannelFrame<D extends AudioDimension> = {
  audioStreams: ArrayLike<SignalProcessingFnInput<D>>
  parameters?: { [id: string]: any }
}

// NOTE: IODatatypes always process one channel at a time.
export abstract class IODatatype<Channel = any> {
  name: string
  constructor() {
    this.name = this.constructor.name
  }
  abstract dataspecString: string
  abstract numAudioStreams: number
  abstract channelFromAudioData(frame: RawChannelFrame<"channels">): Channel
  abstract __OLD__channelToAudioData(channel: Channel): RawChannelFrame<"channels">
  abstract __OLD__validate(channel: Channel, options?: ObjectOf<any>): void
  abstract __NEW__validateAny(value: any): boolean
  abstract __NEW__toAudioData<D extends AudioDimension>(value: any, sampleIndex?: number): RawChannelFrame<D>
  toString() {
    return `${this.name} (${this.dataspecString})`
  }
  static create(dtype: string, name: string | number): IODatatype {
    switch (dtype.toLowerCase()) {
      case "fft":
      case "stft":
        return new stft()
      case "audio":
        return new audio()
      case "control":
        return new control(name)
      default:
        throw new Error(`Unrecognized dtype ${dtype}. Supported datatypes: ['stft', 'audio', 'control']`)
    }
  }
}

type STFTData = {
  magnitude: ArrayLike<number>
  phase: ArrayLike<number>
}

export class stft extends IODatatype<STFTData> {
  dataspecString: string = '{ magnitude: ArrayLike<number>, phase: ArrayLike<number> }'
  numAudioStreams: number = 3
  constructor(public windowSize?: number) {
    super()
  }
  channelFromAudioData(frame: RawChannelFrame<"channels">): STFTData {
    if (!isType(frame.audioStreams[0], Array)) {
      throw new Error("STFT data must be arrays.")
    }
    // NOTE: Ignore the first audio stream (sync).
    return {
      magnitude: <any>frame.audioStreams[1],
      phase: <any>frame.audioStreams[2]
      // Other FFT traits to give the user?
    }
  }
  __NEW__validateAny<D extends AudioDimension>(
    value: {
      magnitude: SignalProcessingFnInput<D>,
      phase: SignalProcessingFnInput<D>
    }
  ): boolean {
    return value.magnitude != undefined && value.phase != undefined
  }
  __NEW__toAudioData<D extends AudioDimension>(
    value: {
      magnitude: SignalProcessingFnInput<D>,
      phase: SignalProcessingFnInput<D>
    },
    sampleIndex?: number
  ): RawChannelFrame<D> {
    const sync: SignalProcessingFnInput<D> = sampleIndex == undefined ?
      range((value.magnitude as any[]).length)
      : sampleIndex as any
    return {
      audioStreams: [
        sync,
        value.magnitude,
        value.phase
      ]
    }
  }
  __OLD__validate(value: STFTData, { checkLength }: { checkLength: boolean }) {
    if (value == undefined) {
      throw new Error("Expected STFT data, got undefined.")
    }
    if (value.magnitude == undefined || value.phase == undefined) {
      throw new Error("STFT data must have keys magnitude and phase. Given: " + value)
    }
    for (let key of ["magnitude", "phase"] as const) {
      const arr = value[key]
      if (!isArrayLike(value)) {
        throw new Error(`Each STFT value must be an ArrayLike collection of numbers. Given ${key} value with no length property or numeric values.`)
      }
      if (checkLength && arr.length != this.windowSize) {
        throw new Error(`Returned size must be equal to the input FFT windowSize. Expected ${this.windowSize}, given ${key}.length=${arr.length}.`)
      }
    }
  }
  __OLD__channelToAudioData(value: STFTData): RawChannelFrame<"channels"> {
    return {
      audioStreams: [
        range(value.magnitude.length),  // sync signal.
        value.magnitude,
        value.phase
      ].map(toMultiChannelArray)
    }
  }
}

export class audio extends IODatatype<ArrayLike<number>> {
  dataspecString: string = 'ArrayLike<number>'
  __NEW__validateAny<D>(value: SignalProcessingFnInput<D>): boolean {
    return isType(value, Number) || isArrayLike(value)
  }
  __NEW__toAudioData<D extends AudioDimension>(
    value: SignalProcessingFnInput<D>,
    sampleIndex?: number
  ): RawChannelFrame<D> {
    throw new Error("Method not implemented.")
  }
  __OLD__validate(channel: ArrayLike<number>): void {
    if (!isArrayLike(channel)) {
      throw new Error(`Each audio channel must be an ArrayLike collection of numbers. Given value with no length property or numeric values.`)
    }
    if (channel[0] != undefined && !isType(channel[0], Number)) {
      throw new Error(`Audio data must be numbers, given ${channel} (typeof ${typeof channel})`)
    }
  }
  numAudioStreams: number = 1
  channelFromAudioData(frame: RawChannelFrame<"channels">): ArrayLike<number> {
    return frame.audioStreams[0]
  }
  __OLD__channelToAudioData(channel: ArrayLike<number>): RawChannelFrame<"channels"> {
    if (!(channel instanceof Array)) {
      throw new Error(`Audio data must be an array, given type ${typeof channel}.`)
    }
    channel = channel.map(v => isFinite(+v) ? v : 0)
    return {
      audioStreams: [toMultiChannelArray(channel)]
    }
  }
}

export class control extends IODatatype {
  dataspecString: string = 'any'
  __NEW__validateAny(value: any): boolean {
    throw new Error("control is not a valid return type.")
  }
  __NEW__toAudioData<D extends AudioDimension>(value: any, sampleIndex?: number): RawChannelFrame<D> {
    throw new Error("control is not a valid return type.")
  }
  __OLD__validate(value: any): void {
    throw new Error("control is not a valid return type.")
  }
  numAudioStreams: number = 0
  constructor(public parameterKey: string | number) { super() }
  channelFromAudioData(frame: RawChannelFrame<"channels">): any {
    if (frame.parameters == undefined) {
      throw new Error(`undefined parameters, expected key ${this.parameterKey}`)
    }
    return frame.parameters[this.parameterKey]
  }
  __OLD__channelToAudioData(value: any): RawChannelFrame<"channels"> {
    // TODO: how would someone specify the output name?
    return {
      audioStreams: [],
      parameters: { [this.parameterKey]: value }
    }
  }
}

// TODO: use named outputs.
/**
 * Converts a frame of audio data + metadata to and from function I/O types exposed to the user-defined function. The frame may be of any dimension.
 */
export class FrameToSignatureConverter<D extends AudioDimension> {
  constructor(
    public dimension: D,
    public inputSpec: TypedStreamSpec,
    public outputSpec: TypedStreamSpec
  ) { }
  /**
   * Convert raw audio frame data into user-friendly function inputs.
   */
  prepareInputs(frame: RawChannelFrame<D>): SignalProcessingFnInput<D>[] {
    // TODO: fix this function.
    let streamIndex = 0
    const inputs = []
    for (const { type } of this.inputSpec) {
      // TODO: figure out how to pass multiple streams to a channel...
      const inputStreams = ArrayView.createSliceView(
        frame.audioStreams,
        streamIndex,
        streamIndex + type.numAudioStreams
      )
      const input = mapOverChannels(
        this.dimension,
        frame.audioStreams as any,
        channel => {
          type.channelFromAudioData({
            audioStreams: inputStreams as any,
            parameters: frame.parameters
          })
        })
      inputs.push(input)
    }
    return inputs as any
  }
  normalizeOutputs(outputs: unknown): SignalProcessingFnInput<D>[] {
    // try-catch led to terrible performance, using validation instead.
    const originalErrors = this.validateOutputs(outputs)
    if (!originalErrors.length) {
      return <SignalProcessingFnInput<D>[]>outputs
    }
    outputs = [outputs]
    const arrayErrors = this.validateOutputs(outputs)
    if (!arrayErrors.length) {
      return <SignalProcessingFnInput<D>[]>outputs
    }
    throw new Error(`Unable to read outputs from processing function due to the following error(s):
${originalErrors.map(v => " - " + v).join("\n")}

Attempted to wrap output in an array, which failed as well:
${arrayErrors.map(v => " - " + v).join("\n")}`)
  }
  protected validateOutputs(outputs: unknown): string[] {
    if (!isArrayLike(outputs)) {
      return [`Expected function outputs to be an array with the signature ${this.outputSpec} but got '${typeof outputs}' type instead.`]
    }
    if ((<any>outputs).length != this.outputSpec.length) {
      return [`Expected the function to have ${this.outputSpec.length} output(s), expressed as an array with length ${this.outputSpec.length}, but got array of length ${(<any>outputs).length} instead.`]
    }
    return <any>map(<ArrayLike<any>>outputs,
      (v, i) => {
        const spec = this.outputSpec[i]
        // TODO: account for different dimension in datatype string.
        if (!isCorrectOutput(this.dimension, v, spec.type)) {
          return `Error parsing output ${i} ('${spec.name}') of function with dimension='${this.dimension}'. Expected datatype ${spec.type}, given ${v}.`
        }
        return ''
      }
    ).filter(v => !!v)
  }
  protected __OLD__validateOutputs(outputs: unknown) {
    if (!isArrayLike(outputs)) {
      throw new Error(`Expected function outputs to be an array with the signature ${this.outputSpec} but got '${typeof outputs}' type instead.`)
    }
    if ((<any>outputs).length != this.outputSpec.length) {
      throw new Error(`Expected function outputs to be an array with size ${this.outputSpec.length} but got size ${(<any>outputs).length} instead.`)
    }
    const itOutputs = ArrayView.createSliceView(<any>outputs)
    const checkLength = ["all", "time"].includes(this.dimension)
    for (const [output, spec] of zip(itOutputs, this.outputSpec)) {
      try {
        mapOverChannels(
          this.dimension,
          <SignalProcessingFnInput<D>>output,
          channel => spec.type.__OLD__validate(channel, { checkLength })
        )
      } catch (e: any) {
        e.message = `Error parsing output '${spec.name}' with expected datatype ${spec.type}. ${e.message}`
        throw e
      }
    }
  }
  /**
   * Convert user output back into raw data.
   */
  processOutputs(outputs: SignalProcessingFnInput<D>[]): RawChannelFrame<D> {
    const outputAudioStreamParts = []
    for (const [output, specEntry] of zip(outputs, this.outputSpec)) {
      try {
        const streams = this.outputToAudioStreams(output, specEntry.type)
        outputAudioStreamParts.push(streams)
      } catch (e: any) {
        throw new Error(`Expected function outputs to be an array with the signature ${this.outputSpec} but unable to convert output '${specEntry.name}' to the expected type (${specEntry.type}): ${e.message}`)
      }
    }
    return {
      audioStreams: ArrayView.createConcatView(...outputAudioStreamParts)
    }
  }

  protected outputToAudioStreams(
    output: SignalProcessingFnInput<D>,
    type: IODatatype
  ): SignalProcessingFnInput<D>[] {
    const audioStreams: SignalProcessingFnInput<D>[] = []
    // Because channelToAudioData can return multiple streams, we have to do 
    // some funny business. The large dimension returned at the "channel" level 
    // needs to be pushed to the topmost dimension (output level).
    const channelByAudioStream: ArrayLike<number>[][] = range(type.numAudioStreams).fill([] as any) as any

    // 1. Collect flattened output by audioStream index.
    mapOverChannels(
      this.dimension,
      output,
      channel => {
        // TODO: how to handle parameters? Are output parameters allowed?
        const data = type.__OLD__channelToAudioData(channel)
        for (const i of range(type.numAudioStreams)) {
          channelByAudioStream[i].push(data.audioStreams[i])
        }
      }
    )

    // 2. For each audioStream index, create a top-level audioStream by reading 
    // from the flattened array.
    for (const i of range(type.numAudioStreams)) {
      let j = 0  // Indexes the "flattened" array.
      const stream = mapOverChannels(
        this.dimension,
        output,
        _ => channelByAudioStream[i][j++]
      )
      audioStreams.push(stream as SignalProcessingFnInput<D>)
    }
    return audioStreams
  }
}