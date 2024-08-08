import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { FFTInput } from "../io/input/FFTInput.js";
import { IFFT_WORKLET_NAME } from "../worklet/FFTWorklet.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class IFFTComponent extends BaseComponent {
    constructor(fftSize = 128) {
        super();
        this.fftSize = fftSize;
        this.worklet = new AudioWorkletNode(this.audioContext, IFFT_WORKLET_NAME, {
            numberOfInputs: 3,
            numberOfOutputs: 2,
            processorOptions: { useComplexValuedFft: false, fftSize }
        });
        // Inputs
        // TODO: make audio inputs and outputs support connecting to different input
        // numbers so these GainNodes aren't necessary.
        const magnitudeGain = this.audioContext.createGain();
        const phaseGain = this.audioContext.createGain();
        const syncGain = this.audioContext.createGain();
        this.fftIn = new FFTInput('fftIn', this, new AudioRateInput('magnitude', this, magnitudeGain), new AudioRateInput('phase', this, phaseGain), new AudioRateInput('sync', this, syncGain));
        this.defineInputOrOutput('fftIn', this.fftIn, this.inputs);
        // Outputs
        const realGain = this.audioContext.createGain();
        const imaginaryGain = this.audioContext.createGain();
        this.realOutput = this.defineAudioOutput('realOutput', realGain);
        this.imaginaryOutput = this.defineAudioOutput('imaginaryOutput', imaginaryGain);
        this.setDefaultOutput(this.realOutput);
        syncGain.connect(this.worklet, undefined, 0);
        magnitudeGain.connect(this.worklet, undefined, 1);
        phaseGain.connect(this.worklet, undefined, 2);
        this.worklet.connect(realGain, 0);
        this.worklet.connect(imaginaryGain, 1);
    }
}
