import { createConstantSource } from "../shared/util.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class ADSR extends BaseComponent {
    constructor(attackDurationMs, decayDurationMs, sustainAmplitude, releaseDurationMs) {
        super();
        // Inputs
        this.attackEvent = this._defineControlInput('attackEvent');
        this.releaseEvent = this._defineControlInput('releaseEvent');
        this.attackDurationMs = this._defineControlInput('attackDurationMs', attackDurationMs);
        this.decayDurationMs = this._defineControlInput('decayDurationMs', decayDurationMs);
        this.sustainAmplitude = this._defineControlInput('sustainAmplitude', sustainAmplitude);
        this.releaseDurationMs = this._defineControlInput('releaseDurationMs', releaseDurationMs);
        this._paramModulator = createConstantSource(this.audioContext);
        this.audioOutput = this._defineAudioOutput('audioOutput', this._paramModulator);
        this.state = { noteStart: 0, attackFinish: 0, decayFinish: 0 };
        this._preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        const state = this.state;
        if (input == this.attackEvent) {
            state.noteStart = this._now();
            this._paramModulator.offset.cancelScheduledValues(state.noteStart);
            state.attackFinish = state.noteStart + this.attackDurationMs.value / 1000;
            state.decayFinish = state.attackFinish + this.decayDurationMs.value / 1000;
            this._paramModulator.offset.setValueAtTime(0, state.noteStart);
            this._paramModulator.offset.linearRampToValueAtTime(1.0, state.attackFinish);
            // Starts *after* the previous event finishes.
            this._paramModulator.offset.linearRampToValueAtTime(this.sustainAmplitude.value, state.decayFinish);
            this._paramModulator.offset.setValueAtTime(this.sustainAmplitude.value, state.decayFinish);
        }
        else if (input == this.releaseEvent) {
            const releaseStart = this._now();
            let releaseFinish;
            if (releaseStart > state.attackFinish && releaseStart < state.decayFinish) {
                // Special case: the amplitude is in the middle of increasing. If we 
                // immediately release, we risk the note being louder *longer* than if 
                // it was allowed to decay, in the case that the release is longer than 
                // the decay and sustain < 1. So, let it decay, then release.
                releaseFinish = state.decayFinish + this.releaseDurationMs.value / 1000;
            }
            else {
                // Immediately release.
                this._paramModulator.offset.cancelScheduledValues(releaseStart);
                this._paramModulator.offset.setValueAtTime(this._paramModulator.offset.value, releaseStart);
                releaseFinish = releaseStart + this.releaseDurationMs.value / 1000;
            }
            this._paramModulator.offset.linearRampToValueAtTime(0.0, releaseFinish);
        }
    }
}
