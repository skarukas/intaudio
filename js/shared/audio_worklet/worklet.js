/* Define generic audio-rate utility functions. */
export function toMultiChannelArray(array) {
    const proxy = new Proxy(array, {
        get(target, p, receiver) {
            if (p == "left")
                return target[0];
            if (p == "right")
                return target[1];
            return target[p];
        }
    });
    return proxy;
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
function assertValidReturnType(result) {
    if (result === undefined) {
        throw new Error("Expected mapping function to return valid value(s), but got undefined.");
    }
}
function processSamples(fn, inputChunks, outputChunk) {
    var _a, _b;
    const numChannels = (_a = inputChunks[0]) === null || _a === void 0 ? void 0 : _a.length;
    const numSamples = (_b = inputChunks[0][0]) === null || _b === void 0 ? void 0 : _b.length;
    for (let c = 0; c < numChannels; c++) {
        for (let i = 0; i < numSamples; i++) {
            const inputs = inputChunks.map(input => input[c][i]);
            const result = fn(...inputs);
            assertValidReturnType(result);
            outputChunk[c][i] = result;
        }
    }
    return undefined;
}
function processTime(fn, inputChunks, outputChunk) {
    var _a;
    const numChannels = (_a = inputChunks[0]) === null || _a === void 0 ? void 0 : _a.length;
    for (let c = 0; c < numChannels; c++) {
        const inputs = inputChunks.map(input => input[c]);
        const output = fn(...inputs);
        assertValidReturnType(output);
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
    assertValidReturnType(result);
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
    var _a;
    let numOutputChannels;
    const numSamples = (_a = inputChunks[0][0]) === null || _a === void 0 ? void 0 : _a.length;
    for (let i = 0; i < numSamples; i++) {
        // Get the i'th sample, across all channels and inputs.
        const inputs = inputChunks.map(input => {
            const inputChannels = getColumn(input, i);
            return toMultiChannelArray(inputChannels);
        });
        const outputChannels = fn(...inputs).map(v => isFinite(v) ? v : 0);
        assertValidReturnType(outputChannels);
        writeColumn(outputChunk, i, outputChannels);
        numOutputChannels = outputChannels.length;
    }
    return numOutputChannels;
}
export function getProcessingFunction(dimension) {
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
export function serializeFunction(f, dimension) {
    return {
        fnString: f.toString(),
        dimension
    };
}
/********** Worklet-specific code ************/
export const WORKLET_NAME = "function-worklet";
function hasElements(arr) {
    return arr.length && arr[0].length && arr[0][0].length;
}
/* Define AudioWorkletProcessor (if in Worklet) */
if (typeof AudioWorkletProcessor != 'undefined') {
    function deserializeFunction(data) {
        const { fnString, dimension } = data;
        const innerFunction = new Function('return ' + fnString)();
        const applyToChunk = getProcessingFunction(dimension);
        return function processFn(inputs, outputs, __parameters) {
            // Bind to current state.
            const context = { sampleRate, currentTime, currentFrame };
            // Apply across dimensions.
            return applyToChunk(innerFunction.bind(context), inputs, outputs[0]);
        };
    }
    class OperationWorklet extends AudioWorkletProcessor {
        constructor() {
            super();
            // Receives serialized input sent from postMessage() calls.
            // This is used to change the processing function at runtime.
            this.port.onmessage = (event) => {
                this.processImpl = deserializeFunction(event.data);
            };
        }
        process(inputs, outputs, parameters) {
            this.processImpl && this.processImpl(inputs, outputs, parameters);
            return true;
        }
    }
    // Register the AudioWorkletProcessor.
    registerProcessor(WORKLET_NAME, OperationWorklet);
}
