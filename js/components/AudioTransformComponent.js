import constants from "../shared/constants.js";
import { Disconnect } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
function enumValues(Enum) {
    const nonNumericKeys = Object.keys(Enum).filter((item) => {
        return isNaN(Number(item));
    });
    return nonNumericKeys.map(k => Enum[k]);
}
function processSamples(fn, inputChunk, outputChunk) {
    for (let c = 0; c < inputChunk.length; c++) {
        for (let i = 0; i < inputChunk[c].length; i++) {
            outputChunk[c][i] = fn(inputChunk[c][i]);
        }
    }
    return undefined;
}
function processTime(fn, inputChunk, outputChunk) {
    var _a;
    for (let c = 0; c < inputChunk.length; c++) {
        // Assume mutation in-place if the function returns undefined.
        const output = (_a = fn(inputChunk[c])) !== null && _a !== void 0 ? _a : inputChunk[c];
        outputChunk[c].set(output);
    }
    return undefined;
}
/**
 * Apply a fuction across the audio chunk (channels and time).
 *
 * @param fn
 * @param inputChunk
 * @param outputChunk
 * @returns The number of channels output by the function.
 */
function processTimeAndChannels(fn, inputChunk, outputChunk) {
    const result = fn(inputChunk);
    for (let c = 0; c < result.length; c++) {
        if (result[c] == undefined) {
            continue; // This signifies that the channel should be empty.
        }
        outputChunk[c].set(result[c]);
    }
    return result.length;
}
function getColumn(arr, col) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(arr[i][col]);
    }
    return result;
}
function writeColumn(arr, col, values) {
    for (let i = 0; i < arr.length; i++) {
        arr[i][col] = values[i];
    }
}
/**
 * Apply a fuction to each sample, across channels.
 *
 * @param fn
 * @param inputChunk
 * @param outputChunk
 * @returns The number of channels output by the function.
 */
function processChannels(fn, inputChunk, outputChunk) {
    let numOutputChannels = undefined;
    const numSamples = inputChunk[0].length;
    for (let i = 0; i < numSamples; i++) {
        const inputChannels = getColumn(inputChunk, i);
        const outputChannels = fn(inputChannels).map(v => isFinite(v) ? v : 0);
        writeColumn(outputChunk, i, outputChannels);
        numOutputChannels = outputChannels.length;
    }
    return numOutputChannels;
}
function getProcessingFunction(dimension) {
    switch (dimension) {
        case "all":
            return processTimeAndChannels;
        case "channels":
            return processChannels;
        case "time":
            return processTime;
        case "none":
            return processSamples;
        default:
            throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`);
    }
}
export class AudioTransformComponent extends BaseComponent {
    constructor(fn, dimension, windowSize, numInputChannels = 2) {
        super();
        this.fn = fn;
        this.applyToChunk = getProcessingFunction(dimension);
        const numOutputChannels = this.inferNumOutputChannels(numInputChannels, windowSize);
        this.processor = this.audioContext.createScriptProcessor(windowSize, numInputChannels, numOutputChannels);
        // Store true values because the constructor settings are not persisted on 
        // the WebAudio object.
        this.processor['__numInputChannels'] = numInputChannels;
        this.processor['__numOutputChannels'] = numOutputChannels;
        this.input = this.defineAudioInput('input', this.processor);
        this.output = this.defineAudioOutput('output', this.processor);
        this.defineAudioProcessHandler(this.processor);
    }
    /**
     * Guess the number of output channels by applying the function to a fake input.
     */
    inferNumOutputChannels(numInputChannels, windowSize) {
        const numSamples = windowSize || 256;
        function createChunk(numChannels) {
            const shell = Array(numChannels).fill(0);
            return shell.map(() => new Float32Array(numSamples));
        }
        const fillerIn = createChunk(numInputChannels);
        // The output may have more channels than the input, so be flexible when 
        // testing it so as to not break the implementation.
        const fillerOut = createChunk(constants.MAX_CHANNELS);
        // The returned value will be the number of new output channels, if it's 
        // different from the provided buffer size, otherwise undefined.
        const numOutputChannels = this.applyToChunk(this.fn, fillerIn, fillerOut);
        return numOutputChannels !== null && numOutputChannels !== void 0 ? numOutputChannels : numInputChannels;
    }
    defineAudioProcessHandler(processor) {
        const handler = (event) => {
            try {
                this.processAudioFrame(event.inputBuffer, event.outputBuffer);
            }
            catch (e) {
                processor.removeEventListener(constants.EVENT_AUDIOPROCESS, handler);
                e instanceof Disconnect || console.error(e);
            }
        };
        processor.addEventListener(constants.EVENT_AUDIOPROCESS, handler);
    }
    processAudioFrame(inputBuffer, outputBuffer) {
        const inputChunk = [];
        const outputChunk = [];
        for (let c = 0; c < inputBuffer.numberOfChannels; c++) {
            inputChunk.push(inputBuffer.getChannelData(c));
        }
        for (let c = 0; c < outputBuffer.numberOfChannels; c++) {
            outputChunk.push(outputBuffer.getChannelData(c));
        }
        this.applyToChunk(this.fn, inputChunk, outputChunk);
    }
}
