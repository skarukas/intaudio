import { enumerate, isType, zip } from "../../shared/util.js"
import { SignalProcessingFnInput } from "./types.js"
import { ArrayView } from "./views.js"

type RawFrame = {
  audioStreams: SignalProcessingFnInput<any>[]
  parameters?: { [id: string]: any }
}

abstract class IODatatype<T = any> {
  abstract numAudioStreams: number
  abstract fromAudioData(frame: RawFrame): T
  abstract toAudioData(value: T): RawFrame
  toString() {
    return this.constructor.name
  }
}

type Except<BaseType, E> = BaseType extends E ? never : BaseType

type STFTData = {
  magnitude: Except<SignalProcessingFnInput<any>, number>
  phase: Except<SignalProcessingFnInput<any>, number>
}

class STFT extends IODatatype<STFTData> {
  numAudioStreams: number = 3
  constructor(public windowSize: number) {
    super()
  }
  fromAudioData(frame: RawFrame): STFTData {
    if (!isType(frame.audioStreams[0], Array)) {
      throw new Error("STFT data must be arrays.")
    }
    // TODO: validate...
    return {
      magnitude: <any>frame.audioStreams[1],
      phase: <any>frame.audioStreams[2]
      // Other FFT traits?
    }
  }
  toAudioData(value: STFTData): RawFrame {
    // TODO: validate...
    if (
      value.magnitude.length != this.windowSize
      && value.phase.length != this.windowSize
    ) {
      throw new Error(`Returned size must be equal to the input FFT windowSize. Expected ${this.windowSize}, given magnitude.length=${value.magnitude.length} and phase.length=${value.phase.length}.`)
    }
    return {
      audioStreams: [
        <number[]>Array.prototype.map.call(value.magnitude, (v: number, i: number) => i),
        value.magnitude,
        value.phase
      ]
    }
  }
}

class Audio extends IODatatype<SignalProcessingFnInput<any>> {
  numAudioStreams: number = 1
  fromAudioData(frame: RawFrame): SignalProcessingFnInput<any> {
    return frame.audioStreams[0]
  }
  toAudioData(value: SignalProcessingFnInput<any>): RawFrame {
    if (!(value instanceof Array)) {
      throw new Error(`Audio data must be an array, given type ${typeof value}.`)
    }
    return { audioStreams: [value] }
  }
}

class Control extends IODatatype {
  numAudioStreams: number = 0
  constructor(public parameterKey: string) { super() }
  fromAudioData(frame: RawFrame): any {
    if (frame.parameters == undefined) {
      throw new Error(`undefined parameters, expected key ${this.parameterKey}`)
    }
    return frame.parameters[this.parameterKey]
  }
  toAudioData(value: any): RawFrame {
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
export class FrameToSignatureConverter {
  constructor(
    public inputSignature: IODatatype[],
    public outputSignature: IODatatype[]
  ) { }
  /**
   * Convert raw audio frame data into user-friendly function inputs.
   */
  prepareInputs(frame: RawFrame): any[] {
    let streamIndex = 0
    const inputs = []
    for (const inputType of this.inputSignature) {
      const inputStreams = ArrayView.createSliceView(
        frame.audioStreams,
        streamIndex,
        streamIndex + inputType.numAudioStreams
      )
      inputs.push(inputType.fromAudioData({
        audioStreams: inputStreams,
        parameters: frame.parameters
      }))
    }
    return inputs
  }
  /**
   * Convert user output back into raw data.
   */
  processOutputs(outputs: SignalProcessingFnInput<any>[]): RawFrame {
    if (!isType(outputs, Array)) {
      if (this.outputSignature.length == 1) {
        // This is an edge case that is allowed--the user returns a single value
        // where an array of size 1 is expected.
        outputs = [outputs]
      } else {
        throw new Error(`Expected function outputs to be an array with the signature [${this.outputSignature}] but got '${typeof outputs}' type instead.`)
      }
    }
    if (outputs.length != this.outputSignature.length) {
      throw new Error(`Expected function outputs to be an array with size ${this.outputSignature.length} but got size ${outputs.length} instead.`)
    }
    const outputAudioStreamParts = []
    const outputParams = {}
    for (
      const [i, [output, outputType]]
      of enumerate(zip(outputs, this.outputSignature))
    ) {
      try {
        const frame = outputType.toAudioData(output)
        outputAudioStreamParts.push(frame.audioStreams)
        Object.assign(outputParams, frame.parameters)
      } catch (e: any) {
        throw new Error(`Expected function outputs to be an array with the signature [${this.outputSignature}] but output ${i} did not match the expected type (${outputType}): ${e.message}`)
      }
    }
    return {
      audioStreams: ArrayView.createConcatView(...outputAudioStreamParts),
      parameters: outputParams
    }
  }
}