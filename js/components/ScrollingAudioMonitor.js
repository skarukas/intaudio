// TODO: this has a limited sample rate. Instead, develop an "oscilloscope" 
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ScrollingAudioMonitor_instances, _ScrollingAudioMonitor_addToMemory;
import { createConstantSource } from "../shared/util.js";
import { VisualComponent } from "./base/VisualComponent.js";
// one that captures N samples and displays them all at the same time.
export class ScrollingAudioMonitor extends VisualComponent {
    constructor(samplePeriodMs, memorySize = 128, minValue = 'auto', maxValue = 'auto', hideZeroSignal = true) {
        super();
        _ScrollingAudioMonitor_instances.add(this);
        samplePeriodMs !== null && samplePeriodMs !== void 0 ? samplePeriodMs : (samplePeriodMs = this.config.defaultSamplePeriodMs);
        this.display = new this._.ScrollingAudioMonitorDisplay(this);
        this._sampler = new this._.AudioRateSignalSampler(samplePeriodMs);
        this._passthrough = createConstantSource(this.audioContext);
        // Inputs
        this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs);
        this.memorySize = this.defineControlInput('memorySize', memorySize);
        this.minValue = this.defineControlInput('minValue', minValue);
        this.maxValue = this.defineControlInput('maxValue', maxValue);
        this.hideZeroSignal = this.defineControlInput('hideZeroSignal', hideZeroSignal);
        this.input = this.defineAudioInput('input', this._passthrough.offset);
        this.setDefaultInput(this.input);
        // Output
        this.audioOutput = this.defineAudioOutput('audioOutput', this._passthrough);
        this.controlOutput = this.defineControlOutput('controlOutput');
        // Routing
        this.audioOutput.connect(this._sampler.audioInput);
        this._sampler.controlOutput.onUpdate((v) => {
            __classPrivateFieldGet(this, _ScrollingAudioMonitor_instances, "m", _ScrollingAudioMonitor_addToMemory).call(this, v);
            this.display.updateWaveformDisplay();
            this.controlOutput.setValue(v);
        });
        this._memory = Array(this.memorySize.value).fill(0.);
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.memorySize) {
            throw new Error("Can't update memorySize yet.");
        }
        else if (input == this.samplePeriodMs) {
            this._sampler.samplePeriodMs.setValue(newValue);
        }
    }
    getCurrentValueRange() {
        let minValue = this.minValue.value == 'auto' ? Math.min(...this._memory) : this.minValue.value;
        let maxValue = this.maxValue.value == 'auto' ? Math.max(...this._memory) : this.maxValue.value;
        let isEmptyRange = (minValue == maxValue);
        if (!Number.isFinite(minValue) || isEmptyRange) {
            minValue = -1;
        }
        if (!Number.isFinite(maxValue) || isEmptyRange) {
            maxValue = 1;
        }
        return { minValue, maxValue };
    }
}
_ScrollingAudioMonitor_instances = new WeakSet(), _ScrollingAudioMonitor_addToMemory = function _ScrollingAudioMonitor_addToMemory(v) {
    this._memory.push(v);
    if (this._memory.length > this.memorySize.value) {
        this._memory.shift();
    }
};
// Display options. TODO: move to display class?
ScrollingAudioMonitor.defaultHeight = 64;
ScrollingAudioMonitor.defaultWidth = 256;
