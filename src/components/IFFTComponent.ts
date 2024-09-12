import { FFTInput } from "../io/input/FFTInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { IFFT_WORKLET_NAME } from "../worklet/FFTWorklet.js";
import { BaseComponent } from "./base/BaseComponent.js";


export class IFFTComponent extends BaseComponent {
  readonly fftIn: FFTInput
  readonly realOutput: AudioRateOutput
  readonly imaginaryOutput: AudioRateOutput
  protected worklet: AudioWorkletNode

  constructor(public fftSize: number = 128) {
    super()
    this.worklet = new AudioWorkletNode(this.audioContext, IFFT_WORKLET_NAME, {
      numberOfInputs: 3,
      numberOfOutputs: 2,
      processorOptions: { useComplexValuedFft: false, fftSize }
    })

    // Inputs
    this.fftIn = new this._.FFTInput(
      'fftIn',
      this,
      new this._.AudioRateInput(
        'magnitude', this, new this._.NodeInputPort(this.worklet, 1)),
      new this._.AudioRateInput(
        'phase', this, new this._.NodeInputPort(this.worklet, 2)),
      new this._.AudioRateInput(
        'sync', this, new this._.NodeInputPort(this.worklet, 0))
    )
    this.defineInputOrOutput('fftIn', this.fftIn, this.inputs)

    // Outputs
    this.realOutput = this.defineAudioOutput(
      'realOutput', new this._.NodeOutputPort(this.worklet, 0))
    this.imaginaryOutput = this.defineAudioOutput(
      'imaginaryOutput', new this._.NodeOutputPort(this.worklet, 1))
    this.setDefaultOutput(this.realOutput)
  }
}