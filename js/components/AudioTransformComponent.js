import constants from "../shared/constants.js";
import { toMultiChannelArray } from "../shared/multichannel.js";
import describeFunction from 'function-descriptor';
import { Disconnect } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
import { createScriptProcessorNode, range } from "../shared/util.js";
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
    constructor(fn, { dimension, windowSize = undefined, inputNames = undefined, numInputs = undefined, numChannelsPerInput = 2, numOutputChannels = undefined }) {
        super();
        this.fn = fn;
        // Properties.
        this.applyToChunk = getProcessingFunction(dimension);
        if (inputNames != undefined) {
            if (numInputs != undefined && numInputs != inputNames.length) {
                throw new Error(`If both numInputs and inputNames are provided, they must match. Given numInputs=${numInputs}, inputNames=[${inputNames}]`);
            }
        }
        else {
            inputNames = this.inferParamNames(fn, numChannelsPerInput, numInputs);
        }
        numInputs !== null && numInputs !== void 0 ? numInputs : (numInputs = inputNames.length);
        numOutputChannels !== null && numOutputChannels !== void 0 ? numOutputChannels : (numOutputChannels = this.inferNumOutputChannels(numChannelsPerInput, windowSize));
        this.numInputs = numInputs;
        this.numChannelsPerInput = numChannelsPerInput;
        // Audio nodes.
        const { processor, inputs } = AudioTransformComponent.defineAudioGraph({
            numInputs,
            numChannelsPerInput,
            windowSize,
            numOutputChannels
        });
        this.defineAudioProcessHandler(processor);
        // I/O.
        for (const i of range(numInputs)) {
            this[inputNames[i]] = this.defineAudioInput(inputNames[i], inputs[i]);
            this[i] = this[inputNames[i]]; // Numbered alias.
        }
        this.output = this.defineAudioOutput('output', processor);
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
    inferParamNames(fn, numChannelsPerInput, numInputs) {
        const maxSafeInputs = Math.floor(constants.MAX_CHANNELS / numChannelsPerInput);
        let descriptor;
        try {
            descriptor = describeFunction(fn);
        }
        catch (e) {
            numInputs !== null && numInputs !== void 0 ? numInputs : (numInputs = maxSafeInputs);
            console.warn(`Unable to infer the input signature from the given function. Pass inputNames directly in the ${this._className} constructor instead. Defaulting to ${numInputs} inputs, named by their index.\nOriginal error: ${e.message}`);
            return range(numInputs);
        }
        // The node only supports a limited number of channels, so we can only 
        // use the first few.
        if (numInputs == undefined) {
            if (descriptor.maxArgs > maxSafeInputs) {
                console.warn(`Given a function that takes up to ${descriptor.maxArgs} inputs.\nBecause only ${constants.MAX_CHANNELS} channels can be processed by each WebAudio node and each input has ${numChannelsPerInput} channels, only values for the first ${maxSafeInputs} inputs will be used. To suppress this warning, pass numInputs directly in the ${this._className} constructor.`);
                numInputs = maxSafeInputs;
            }
            else {
                numInputs = descriptor.maxArgs;
            }
        }
        else if (numInputs < descriptor.minArgs) {
            throw new Error(`Given a function with ${descriptor.minArgs} required parameters, but expected no more than the supplied value of numInputs (${numInputs}) to ensure inputs are not undefined during signal processing.`);
        }
        return range(numInputs).map(i => {
            var _a;
            const paramDescriptor = descriptor.parameters[i];
            // Parameters may be unnamed if they are object- or array-destructured.
            return (_a = paramDescriptor === null || paramDescriptor === void 0 ? void 0 : paramDescriptor.name) !== null && _a !== void 0 ? _a : i;
        });
    }
    static defineAudioGraph({ numInputs, numChannelsPerInput, windowSize, numOutputChannels }) {
        const totalNumChannels = numInputs * numChannelsPerInput;
        if (totalNumChannels > constants.MAX_CHANNELS) {
            throw new Error(`The total number of input channels must be less than ${constants.MAX_CHANNELS}. Given numInputs=${numInputs} and numChannelsPerInput=${numChannelsPerInput}.`);
        }
        const inputNodes = [];
        const merger = this.audioContext.createChannelMerger(totalNumChannels);
        const processor = createScriptProcessorNode(this.audioContext, windowSize, numChannelsPerInput, numOutputChannels);
        // Merger -> Processor
        merger.connect(processor);
        for (let i = 0; i < numInputs; i++) {
            const input = new GainNode(this.audioContext, { channelCount: numChannelsPerInput });
            // Flattened channel arrangement:
            // [0_left, 0_right, 1_left, 1_right, 2_left, 2_right] 
            for (let j = 0; j < numChannelsPerInput; j++) {
                // Input -> Merger
                const destinationChannel = i * numChannelsPerInput + j;
                input.connect(merger, 0, destinationChannel);
            }
            inputNodes.push(input);
        }
        return {
            inputs: inputNodes,
            processor
        };
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
