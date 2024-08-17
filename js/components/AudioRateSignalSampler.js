var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AudioRateSignalSampler_instances, _AudioRateSignalSampler_setInterval;
import { Disconnect } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
// TODO: make this multi-channel.
export class AudioRateSignalSampler extends BaseComponent {
    // Utility for converting an audio-rate signal into a control signal.
    constructor(samplePeriodMs) {
        super();
        _AudioRateSignalSampler_instances.add(this);
        samplePeriodMs !== null && samplePeriodMs !== void 0 ? samplePeriodMs : (samplePeriodMs = this.config.defaultSamplePeriodMs);
        this._analyzer = this.audioContext.createAnalyser();
        // Inputs
        this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs).ofType(Number);
        this.audioInput = this.defineAudioInput('audioInput', this._analyzer);
        this.setDefaultInput(this.audioInput);
        // Output
        this.controlOutput = this.defineControlOutput('controlOutput').ofType(Number);
        this.preventIOOverwrites();
    }
    getCurrentSignalValue() {
        const dataArray = new Float32Array(1);
        this._analyzer.getFloatTimeDomainData(dataArray);
        return dataArray[0];
    }
    stop() {
        // TODO: figure out how to actually stop this...
        window.clearInterval(this.interval);
    }
    inputAdded(source) {
        var _a;
        if (this.interval) {
            throw new Error("AudioToControlConverter can only have one input.");
        }
        __classPrivateFieldGet(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_setInterval).call(this, (_a = this.samplePeriodMs.value) !== null && _a !== void 0 ? _a : this.config.defaultSamplePeriodMs);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.samplePeriodMs) {
            this.stop();
            __classPrivateFieldGet(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_setInterval).call(this, newValue);
        }
    }
}
_AudioRateSignalSampler_instances = new WeakSet(), _AudioRateSignalSampler_setInterval = function _AudioRateSignalSampler_setInterval(period) {
    this.interval = window.setInterval(() => {
        try {
            const signal = this.getCurrentSignalValue();
            this.controlOutput.setValue(signal);
        }
        catch (e) {
            this.stop();
            if (!(e instanceof Disconnect)) {
                throw e;
            }
        }
    }, period);
};
