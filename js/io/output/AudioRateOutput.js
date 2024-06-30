import { AudioRateSignalSampler } from "../../components/AudioRateSignalSampler.js";
import { AudioRateInput } from "../input/AudioRateInput.js";
import { HybridInput } from "../input/HybridInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
// TODO: Add a GainNode here to allow muting and mastergain of the component.
export class AudioRateOutput extends AbstractOutput {
    constructor(name, audioNode) {
        super(name);
        this.name = name;
        this.audioNode = audioNode;
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (!(input instanceof AudioRateInput || input instanceof HybridInput)) {
            throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use ${AudioRateSignalSampler.name} to force a conversion.`);
        }
        input.audioSink && this.audioNode.connect(input.audioSink);
        this.connections.push(input);
        component === null || component === void 0 ? void 0 : component.wasConnectedTo(this);
        return component;
    }
    sampleSignal(samplePeriodMs) {
        return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs));
    }
}
