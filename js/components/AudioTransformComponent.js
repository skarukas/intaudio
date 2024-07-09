import constants from "../shared/constants.js";
import { toMultiChannelArray } from "../shared/multichannel.js";
import { Disconnect } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
function enumValues(Enum) {
    const nonNumericKeys = Object.keys(Enum).filter((item) => {
        return isNaN(Number(item));
    });
    return nonNumericKeys.map(k => Enum[k]);
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
function assertValidReturnType(fn, result) {
    if (result === undefined) {
        throw new Error("Expected mapping function to return valid value(s), but got undefined.");
    }
}
function processSamples(fn, inputChunks, outputChunk) {
    const numChannels = inputChunks[0].length;
    const numSamples = inputChunks[0][0].length;
    for (let c = 0; c < numChannels; c++) {
        for (let i = 0; i < numSamples; i++) {
            const inputs = inputChunks.map(input => input[c][i]);
            const result = fn(...inputs);
            assertValidReturnType(fn, result);
            outputChunk[c][i] = result;
        }
    }
    return undefined;
}
function processTime(fn, inputChunks, outputChunk) {
    const numChannels = inputChunks[0].length;
    for (let c = 0; c < numChannels; c++) {
        const inputs = inputChunks.map(input => input[c]);
        const output = fn(...inputs);
        assertValidReturnType(fn, output);
        outputChunk[c].set(output);
    }
    return undefined;
}
/**
 * Apply a fuction across the audio chunk (channels and time).
 *
 * @param fn
 * @param inputChunks
 * @param outputChunk
 * @returns The number of channels output by the function.
 */
function processTimeAndChannels(fn, inputChunks, outputChunk) {
    const inputs = inputChunks.map(toMultiChannelArray);
    const result = fn(...inputs);
    assertValidReturnType(fn, result);
    for (let c = 0; c < result.length; c++) {
        if (result[c] == undefined) {
            continue; // This signifies that the channel should be empty.
        }
        outputChunk[c].set(result[c]);
    }
    return result.length;
}
/**
 * Apply a fuction to each sample, across channels.
 *
 * @param fn
 * @param inputChunks
 * @param outputChunk
 * @returns The number of channels output by the function.
 */
function processChannels(fn, inputChunks, outputChunk) {
    let numOutputChannels;
    const numSamples = inputChunks[0][0].length;
    for (let i = 0; i < numSamples; i++) {
        // Get the i'th sample, across all channels and inputs.
        const inputs = inputChunks.map(input => {
            const inputChannels = getColumn(input, i);
            return toMultiChannelArray(inputChannels);
        });
        const outputChannels = fn(...inputs).map(v => isFinite(v) ? v : 0);
        assertValidReturnType(fn, outputChannels);
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
    constructor(fn, { dimension, windowSize = undefined, numChannelsPerInput = 2, numOutputChannels = undefined }) {
        super();
        this.fn = fn;
        this.applyToChunk = getProcessingFunction(dimension);
        numOutputChannels !== null && numOutputChannels !== void 0 ? numOutputChannels : (numOutputChannels = this.inferNumOutputChannels(numChannelsPerInput, windowSize));
        this.processor = this.audioContext.createScriptProcessor(windowSize, numChannelsPerInput, numOutputChannels);
        // Store true values because the constructor settings are not persisted on 
        // the WebAudio object.
        this.processor['__numInputChannels'] = numChannelsPerInput;
        this.processor['__numOutputChannels'] = numOutputChannels;
        this.input = this.defineAudioInput('input', this.processor);
        this.output = this.defineAudioOutput('output', this.processor);
        this.defineAudioProcessHandler(this.processor);
    }
    /**
     * Guess the number of output channels by applying the function to a fake input.
     */
    inferNumOutputChannels(numInputChannels, windowSize) {
        const sampleRate = this.audioContext.sampleRate;
        function createBuffer(numberOfChannels) {
            return new AudioBuffer({
                length: windowSize || 256,
                numberOfChannels,
                sampleRate
            });
        }
        const inputBuffer = createBuffer(numInputChannels);
        // The output may have more channels than the input, so be flexible when 
        // testing it so as to not break the implementation.
        const outputBuffer = createBuffer(constants.MAX_CHANNELS);
        const fillerEvet = new AudioProcessingEvent(constants.EVENT_AUDIOPROCESS, {
            playbackTime: 0,
            inputBuffer,
            outputBuffer
        });
        // The returned value will be the number of new output channels, if it's 
        // different from the provided buffer size, otherwise undefined.
        const numOutputChannels = this.processAudioFrame(fillerEvet);
        return numOutputChannels !== null && numOutputChannels !== void 0 ? numOutputChannels : numInputChannels;
    }
    defineAudioProcessHandler(processor) {
        const handler = (event) => {
            try {
                this.processAudioFrame(event);
            }
            catch (e) {
                processor.removeEventListener(constants.EVENT_AUDIOPROCESS, handler);
                e instanceof Disconnect || console.error(e);
            }
        };
        processor.addEventListener(constants.EVENT_AUDIOPROCESS, handler);
    }
    /**
     * Split out a flattened array of channels into separate inputs.
     */
    deinterleaveInputs(flatInputs) {
        return [flatInputs]; // TODO: implement for multi-input case.
    }
    processAudioFrame(event) {
        const inputChunk = [];
        const outputChunk = [];
        for (let c = 0; c < event.inputBuffer.numberOfChannels; c++) {
            inputChunk.push(event.inputBuffer.getChannelData(c));
        }
        for (let c = 0; c < event.outputBuffer.numberOfChannels; c++) {
            outputChunk.push(event.outputBuffer.getChannelData(c));
        }
        const inputChunks = this.deinterleaveInputs(inputChunk);
        return this.applyToChunk(this.fn.bind(event), inputChunks, outputChunk);
    }
}
