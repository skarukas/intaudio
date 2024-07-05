// TODO: this has a limited sample rate. Instead, develop an "oscilloscope" 
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ScrollingAudioMonitor_instances, _ScrollingAudioMonitor_addToMemory;
import { VisualComponent } from "./base/VisualComponent.js";
// one that captures N samples and displays them all at the same time.
export class ScrollingAudioMonitor extends VisualComponent {
    constructor(samplePeriodMs, memorySize = 128, minValue = 'auto', maxValue = 'auto', hideZeroSignal = true, numChannels = 6) {
        super();
        _ScrollingAudioMonitor_instances.add(this);
        this._memory = []; // Channel * time.
        this._analyzers = [];
        samplePeriodMs !== null && samplePeriodMs !== void 0 ? samplePeriodMs : (samplePeriodMs = this.config.defaultSamplePeriodMs);
        this.display = new this._.ScrollingAudioMonitorDisplay(this);
        this._splitter = this.audioContext.createChannelSplitter();
        this._merger = this.audioContext.createChannelMerger();
        // Inputs
        this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs); // TODO: make work again.
        this.memorySize = this.defineControlInput('memorySize', memorySize);
        this.minValue = this.defineControlInput('minValue', minValue);
        this.maxValue = this.defineControlInput('maxValue', maxValue);
        this.hideZeroSignal = this.defineControlInput('hideZeroSignal', hideZeroSignal);
        this.input = this.defineAudioInput('input', this._splitter);
        this.setDefaultInput(this.input);
        // It seems a subgraph including analyzers may be optimized out when the 
        // sink itself is not an analyzer. So add a no-op analyzer sink to keep the
        // signal flowing.
        this._merger.connect(this.audioContext.createAnalyser());
        // Output
        this.audioOutput = this.defineAudioOutput('audioOutput', this._merger);
        this.controlOutput = this.defineControlOutput('controlOutput');
        // Audio routing
        for (let i = 0; i < numChannels; i++) {
            const analyzer = this.audioContext.createAnalyser();
            this._splitter.connect(analyzer, i, 0).connect(this._merger, 0, i);
            this._analyzers.push(analyzer);
            this._memory.push(Array(this.memorySize.value).fill(0.));
        }
        // Define animation loop
        const updateSignalValues = () => {
            const channelValues = [];
            for (let i = 0; i < numChannels; i++) {
                // Get i'th channel info.
                const dataArray = new Float32Array(128);
                this._analyzers[i].getFloatTimeDomainData(dataArray);
                const v = dataArray[0];
                __classPrivateFieldGet(this, _ScrollingAudioMonitor_instances, "m", _ScrollingAudioMonitor_addToMemory).call(this, this._memory[i], v);
                channelValues.push(v);
            }
            this.display.updateWaveformDisplay();
            this.controlOutput.setValue(channelValues);
            requestAnimationFrame(updateSignalValues);
        };
        updateSignalValues();
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.memorySize) {
            throw new Error("Can't update memorySize yet.");
        }
        else if (input == this.samplePeriodMs) {
            //this._sampler.samplePeriodMs.setValue(<number>newValue)
        }
    }
    getCurrentValueRange() {
        let minValue = this.minValue.value == 'auto' ? Math.min(...this._memory.map(a => Math.min(...a))) : this.minValue.value;
        let maxValue = this.maxValue.value == 'auto' ? Math.max(...this._memory.map(a => Math.max(...a))) : this.maxValue.value;
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
_ScrollingAudioMonitor_instances = new WeakSet(), _ScrollingAudioMonitor_addToMemory = function _ScrollingAudioMonitor_addToMemory(arr, v) {
    arr.push(v);
    if (arr.length > this.memorySize.value) {
        arr.shift();
    }
};
// Display options. TODO: move to display class?
ScrollingAudioMonitor.defaultHeight = 64;
ScrollingAudioMonitor.defaultWidth = 256;
