import { MemoryBuffer } from "./MemoryBuffer.js";
import { SignalProcessingContext } from "./SignalProcessingContext.js";
import { generateZeroInput } from "./utils.js";
const ALL_CHANNELS = -1;
/**
 * A class collecting all current ongoing memory streams. Because some `dimension` settings process channels in parallel (`"none"` and `"time"`), memory streams are indexed by channel.
 */
export class SignalProcessingContextFactory {
    constructor({ numInputs, numChannelsPerInput, numOutputChannels, windowSize, dimension, sampleRate = undefined, getFrameIndex = undefined, getCurrentTime = undefined, }) {
        this.inputHistory = {};
        this.outputHistory = {};
        this.windowSize = windowSize;
        this.sampleRate = sampleRate;
        this.getCurrentTime = getCurrentTime;
        this.getFrameIndex = getFrameIndex;
        const genInput = this.getDefaultInputValueFn({ dimension, numInputs, windowSize, numChannelsPerInput });
        const genOutput = this.getDefaultOutputValueFn({ dimension, windowSize, numOutputChannels });
        const hasChannelSpecificProcessing = ["all", "channels"].includes(dimension);
        if (hasChannelSpecificProcessing) {
            this.inputHistory[ALL_CHANNELS] = new MemoryBuffer(genInput);
            this.outputHistory[ALL_CHANNELS] = new MemoryBuffer(genOutput);
        }
        else {
            // Each channel is processed the same.
            for (let c = 0; c < numChannelsPerInput; c++) {
                this.inputHistory[c] = new MemoryBuffer(genInput);
            }
            for (let c = 0; c < numOutputChannels; c++) {
                this.outputHistory[c] = new MemoryBuffer(genOutput);
            }
        }
    }
    getDefaultInputValueFn({ dimension, numInputs, windowSize, numChannelsPerInput }) {
        return function genInput() {
            const defaultInput = [];
            for (let i = 0; i < numInputs; i++) {
                defaultInput.push(generateZeroInput(dimension, windowSize, numChannelsPerInput));
            }
            return defaultInput;
        };
    }
    getDefaultOutputValueFn({ dimension, windowSize, numOutputChannels }) {
        return function genOutput() {
            return generateZeroInput(dimension, windowSize, numOutputChannels);
        };
    }
    getContext({ channelIndex = ALL_CHANNELS, sampleIndex = undefined } = {}) {
        const inputMemory = this.inputHistory[channelIndex];
        const outputMemory = this.outputHistory[channelIndex];
        return new SignalProcessingContext(inputMemory, outputMemory, {
            windowSize: this.windowSize,
            channelIndex,
            sampleIndex,
            sampleRate: this.sampleRate,
            frameIndex: this.getFrameIndex(),
            currentTime: this.getCurrentTime()
        });
    }
}
