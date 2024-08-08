import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { HybridOutput } from "../io/output/HybridOutput.js";
import { BaseComponent } from "./base/BaseComponent.js";
const PRIVATE_CONSTRUCTOR = Symbol("PRIVATE_CONSTRUCTOR");
export class ChannelStacker extends BaseComponent {
    constructor(numChannelsPerInput, __privateConstructorCall = undefined) {
        super();
        this.stackedInputs = [];
        if (__privateConstructorCall !== PRIVATE_CONSTRUCTOR) {
            throw new Error("ChannelStacker cannot be constructed directly. Use ChannelStacker.fromInputs instead.");
        }
        const numOutputChannels = numChannelsPerInput.reduce((a, b) => a + b);
        const merger = this.audioContext.createChannelMerger(numOutputChannels);
        let outChannel = 0;
        for (let i = 0; i < numChannelsPerInput.length; i++) {
            const splitter = this.audioContext.createChannelSplitter();
            // Route inputs to outputs
            for (let inChannel = 0; inChannel < numChannelsPerInput[i]; inChannel++) {
                splitter.connect(merger, inChannel, outChannel);
                outChannel++;
            }
            const input = this.defineAudioInput("" + i, splitter);
            this.stackedInputs.push(input);
            this[i] = input;
        }
        this.output = this.defineAudioOutput('output', merger);
    }
    static fromInputs(destinations) {
        const inputs = [];
        const numChannelsPerInput = [];
        const inputObj = {};
        for (let i = 0; i < destinations.length; i++) {
            let output = destinations[i];
            if (output instanceof BaseComponent) {
                output = output.getDefaultOutput();
            }
            if (!(output instanceof HybridOutput || output instanceof AudioRateOutput)) {
                throw new Error(`A ChannelStacker can only be created from audio-rate outputs. Given ${destinations[i]}, which is not an audio-rate outputs nor a component with a default audio-rate outputs.`);
            }
            inputs.push(output);
            numChannelsPerInput.push(output.numOutputChannels);
            inputObj[i] = destinations[i];
        }
        const stacker = new this._.ChannelStacker(numChannelsPerInput, PRIVATE_CONSTRUCTOR);
        return stacker.withInputs(inputObj);
    }
}
