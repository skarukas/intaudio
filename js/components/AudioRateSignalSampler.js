var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _AudioRateSignalSampler_instances, _AudioRateSignalSampler_interval, _AudioRateSignalSampler_getCurrentSignalValue, _AudioRateSignalSampler_setInterval;
import { BaseComponent } from "./base/BaseComponent.js";
export class AudioRateSignalSampler extends BaseComponent {
    // Utility for converting an audio-rate signal into a control signal.
    constructor(samplePeriodMs) {
        super();
        _AudioRateSignalSampler_instances.add(this);
        _AudioRateSignalSampler_interval.set(this, void 0);
        samplePeriodMs !== null && samplePeriodMs !== void 0 ? samplePeriodMs : (samplePeriodMs = this.config.defaultSamplePeriodMs);
        this._analyzer = this.audioContext.createAnalyser();
        // Inputs
        this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs);
        this.audioInput = this.defineAudioInput('audioInput', this._analyzer);
        this.setDefaultInput(this.audioInput);
        // Output
        this.controlOutput = this.defineControlOutput('controlOutput');
        this.preventIOOverwrites();
    }
    stop() {
        // TODO: figure out how to actually stop this...
        window.clearInterval(__classPrivateFieldGet(this, _AudioRateSignalSampler_interval, "f"));
    }
    inputAdded(input) {
        if (__classPrivateFieldGet(this, _AudioRateSignalSampler_interval, "f")) {
            throw new Error("AudioToControlConverter can only have one input.");
        }
        __classPrivateFieldGet(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_setInterval).call(this, this.samplePeriodMs.value);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.samplePeriodMs) {
            this.stop();
            __classPrivateFieldGet(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_setInterval).call(this, newValue);
        }
    }
}
_AudioRateSignalSampler_interval = new WeakMap(), _AudioRateSignalSampler_instances = new WeakSet(), _AudioRateSignalSampler_getCurrentSignalValue = function _AudioRateSignalSampler_getCurrentSignalValue() {
    const dataArray = new Float32Array(1);
    this._analyzer.getFloatTimeDomainData(dataArray);
    return dataArray[0];
}, _AudioRateSignalSampler_setInterval = function _AudioRateSignalSampler_setInterval(period) {
    __classPrivateFieldSet(this, _AudioRateSignalSampler_interval, window.setInterval(() => {
        try {
            const signal = __classPrivateFieldGet(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_getCurrentSignalValue).call(this);
            this.controlOutput.setValue(signal);
        }
        catch (e) {
            this.stop();
            throw e;
        }
    }, period), "f");
};
