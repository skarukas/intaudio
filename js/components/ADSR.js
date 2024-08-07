import { createConstantSource } from "../shared/util.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class ADSR extends BaseComponent {
    constructor(attackDurationMs, decayDurationMs, sustainAmplitude, releaseDurationMs) {
        super();
        // Inputs
        this.attackEvent = this.defineControlInput('attackEvent').ofType(Symbol);
        this.releaseEvent = this.defineControlInput('releaseEvent').ofType(Symbol);
        this.attackDurationMs = this.defineControlInput('attackDurationMs', attackDurationMs).ofType(Number);
        this.decayDurationMs = this.defineControlInput('decayDurationMs', decayDurationMs).ofType(Number);
        this.sustainAmplitude = this.defineControlInput('sustainAmplitude', sustainAmplitude).ofType(Number);
        this.releaseDurationMs = this.defineControlInput('releaseDurationMs', releaseDurationMs).ofType(Number);
        this._paramModulator = createConstantSource(this.audioContext);
        this.audioOutput = this.defineAudioOutput('audioOutput', this._paramModulator);
        this.state = { noteStart: 0, attackFinish: 0, decayFinish: 0 };
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        const state = this.state;
        if (input == this.attackEvent) {
            state.noteStart = this.now();
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
            const releaseStart = this.now();
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
