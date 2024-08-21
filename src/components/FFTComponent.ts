import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { CompoundOutput } from "../io/output/CompoundOutput.js";
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
    // TODO: make audio inputs and outputs support connecting to different input
    // numbers so these GainNodes aren't necessary.
    const realGain = this.audioContext.createGain()
    const imaginaryGain = this.audioContext.createGain()
    this.realInput = this.defineAudioInput('realInput', realGain)
    this.imaginaryInput = this.defineAudioInput('imaginaryInput', imaginaryGain)
    this.setDefaultInput(this.realInput)

    const magnitudeGain = this.audioContext.createGain()
    const phaseGain = this.audioContext.createGain()
    const syncGain = this.audioContext.createGain()

    // Output
    this.fftOut = new this._.FFTOutput(
      'fftOut',
      new this._.AudioRateOutput('magnitude', magnitudeGain, this),
      new this._.AudioRateOutput('phase', phaseGain, this),
      new this._.AudioRateOutput('sync', syncGain, this),
      this,
      this.fftSize
    )
    this.defineInputOrOutput('fftOut', this.fftOut, this.outputs)

    realGain.connect(this.worklet, undefined, 0)
    imaginaryGain.connect(this.worklet, undefined, 1)
    this.worklet.connect(syncGain, 0)
    this.worklet.connect(magnitudeGain, 1)
    this.worklet.connect(phaseGain, 2)
  }
  ifft(): AudioSignalStream {
    return this.fftOut.ifft()
  }
}