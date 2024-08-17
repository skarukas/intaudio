import { WaveType } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class Wave extends BaseComponent {
    constructor(wavetableOrType, frequency) {
        super();
        let waveType;
        let wavetable;
        if (wavetableOrType instanceof PeriodicWave) {
            wavetable = wavetableOrType;
            waveType = WaveType.CUSTOM;
        }
        else if (Object.values(Wave.Type).includes(wavetableOrType)) {
            waveType = wavetableOrType;
        }
        this._oscillatorNode = new OscillatorNode(this.audioContext, {
            type: waveType,
            frequency: frequency,
            periodicWave: wavetable
        });
        this._oscillatorNode.start();
        this.type = this.defineControlInput('type', waveType).ofType(String);
        this.waveTable = this.defineControlInput('waveTable', wavetable).ofType(PeriodicWave);
        this.frequency = this.defineAudioInput('frequency', this._oscillatorNode.frequency).ofType(Number);
        this.output = this.defineAudioOutput('output', this._oscillatorNode);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.waveTable) {
            this._oscillatorNode.setPeriodicWave(newValue);
        }
        else if (input == this.type) {
            // TODO: figure this out.
            this._oscillatorNode.type = newValue;
        }
    }
    static fromPartials(frequency, magnitudes, phases) {
        let realCoefficients = [];
        let imagCoefficients = [];
        for (let i = 0; i < magnitudes.length; i++) {
            let theta = (phases && phases[i]) ? phases[i] : 0;
            let r = magnitudes[i];
            realCoefficients.push(r * Math.cos(theta));
            imagCoefficients.push(r * Math.sin(theta));
        }
        // this == class in static contexts.
        return this.fromCoefficients(frequency, realCoefficients, imagCoefficients);
    }
    static fromCoefficients(frequency, real, imaginary) {
        imaginary !== null && imaginary !== void 0 ? imaginary : (imaginary = [...real].map(_ => 0));
        const wavetable = this.audioContext.createPeriodicWave(real, imaginary);
        return new this._.Wave(wavetable, frequency);
    }
}
Wave.Type = WaveType;
