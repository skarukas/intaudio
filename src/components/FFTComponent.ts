import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { FFTOutput } from "../io/output/FFTOutput.js";
import { AudioSignalStream } from "../shared/AudioSignalStream.js";
import { FFTStream } from "../shared/FFTStream.js";
import { FFT_WORKLET_NAME } from "../worklet/FFTWorklet.js";
import { BaseComponent } from "./base/BaseComponent.js";


export class FFTComponent extends BaseComponent implements FFTStream {
  readonly realInput: AudioRateInput
  readonly imaginaryInput: AudioRateInput
  readonly fftOut: FFTOutput

  protected worklet: AudioWorkletNode

  constructor(public fftSize: number = 128) {
    super()
    this.worklet = new AudioWorkletNode(this.audioContext, FFT_WORKLET_NAME, {
      numberOfInputs: 2,
      numberOfOutputs: 3,
      processorOptions: { useComplexValuedFft: false, fftSize }
    })
    // Inputs
    this.realInput = this.defineAudioInput(
      'realInput', new this._.NodeInputPort(this.worklet, 0))
    this.imaginaryInput = this.defineAudioInput(
      'imaginaryInput', new this._.NodeInputPort(this.worklet, 1))
    this.setDefaultInput(this.realInput)

    // Output
    this.fftOut = new this._.FFTOutput(
      'fftOut',
      new this._.AudioRateOutput(
        'magnitude', new this._.NodeOutputPort(this.worklet, 1), this),
      new this._.AudioRateOutput(
        'phase', new this._.NodeOutputPort(this.worklet, 2), this),
      new this._.AudioRateOutput(
        'sync', new this._.NodeOutputPort(this.worklet, 0), this),
      this,
      this.fftSize
    )
    this.defineInputOrOutput('fftOut', this.fftOut, this.outputs)
  }
  ifft(): AudioSignalStream {
    return this.fftOut.ifft()
  }
}