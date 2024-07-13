// TODO: split up this file into many modules and generate the worklet file with rollup instead.
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
function processSamples(fn, inputChunks, outputChunk, contextFactory) {
    var _a, _b;
    const numChannels = (_a = inputChunks[0]) === null || _a === void 0 ? void 0 : _a.length;
    const numSamples = (_b = inputChunks[0][0]) === null || _b === void 0 ? void 0 : _b.length;
    for (let c = 0; c < numChannels; c++) {
        for (let i = 0; i < numSamples; i++) {
            const inputs = inputChunks.map(input => input[c][i]);
            const context = contextFactory.getContext({ channelIndex: c, sampleIndex: i });
            const result = context.execute(fn, inputs);
            assertValidReturnType(result);
            outputChunk[c][i] = result;
        }
    }
    return undefined;
}
function processTime(fn, inputChunks, outputChunk, contextFactory) {
    var _a;
    const numChannels = (_a = inputChunks[0]) === null || _a === void 0 ? void 0 : _a.length;
    for (let c = 0; c < numChannels; c++) {
        const inputs = inputChunks.map(input => input[c]);
        const context = contextFactory.getContext({ channelIndex: c });
        const output = context.execute(fn, inputs);
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
function processTimeAndChannels(fn, inputChunks, outputChunk, contextFactory) {
    const inputs = inputChunks.map(toMultiChannelArray);
    const context = contextFactory.getContext();
    const result = context.execute(fn, inputs);
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
function processChannels(fn, inputChunks, outputChunk, contextFactory) {
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
/**
 * Returns a structure filled with zeroes that represents the shape of a single input or the output.
 */
export function generateZeroInput(dimension, windowSize, numChannels) {
    switch (dimension) {
        case "all":
            const frame = [];
            for (let i = 0; i < numChannels; i++) {
                frame.push(new Float32Array(windowSize));
            }
            return toMultiChannelArray(frame);
        case "channels":
            const channels = Array(windowSize).fill(0);
            return toMultiChannelArray(channels);
        case "time":
            return new Float32Array(windowSize);
        case "none":
            return 0;
        default:
            throw new Error(`Invalid AudioDimension: ${dimension}. Expected one of ["all", "none", "channels", "time"]`);
    }
}
export function serializeWorkletMessage(f, { dimension, numInputs, numChannelsPerInput, numOutputChannels, windowSize }) {
    return {
        fnString: f.toString(),
        dimension,
        numInputs,
        numChannelsPerInput,
        numOutputChannels,
        windowSize
    };
}
/**
 * A data structure storing the last N values in a time series.
 *
 * It is implemented as a circular array to avoid processing when the time step
 * is incremented.
 *
 * Here's a demonstration with eaach t[n] being an absolute time, | showing
 * the position of the offset, and _ being the default value.
 *
 * "Initial" state storing the first 4 values:
 * - circularBuffer: [|v3 v2 v1 v0]
 * - offset: 0
 *
 * > get(0) = v3
 * > get(1) = v2
 * > get(4) = _
 *
 * After add(v4):
 * - circularBuffer: [v3 v2 v1 | v4]
 * - offset: 3
 *
 * > get(0) = v4
 * > get(1) = v3
 *
 * After setSize(8):
 * - circularBuffer: [|v4 v3 v2 v1 _ _ _ _]
 * - offset: 0
 *
 */
class MemoryBuffer {
    constructor(defaultValueFn) {
        this.defaultValueFn = defaultValueFn;
        this.circularBuffer = [];
        // offset will always be within range, and circularBuffer[offset] is the 
        // most recent value (circularBuffer[offset+1] is the one before that, etc.)
        this.offset = 0;
    }
    get length() {
        return this.circularBuffer.length;
    }
    toInnerIndex(i) {
        return (i + this.offset) % this.length;
    }
    /**
     * Get the ith value of the memory. Note that index 0 is the previous value, not 1.
     */
    get(i) {
        if (i >= this.length) {
            return this.defaultValueFn();
        }
        else {
            const innerIdx = this.toInnerIndex(i);
            return this.circularBuffer[innerIdx];
        }
    }
    /**
     * Add `val` to the array of memory, incrementing the time step. If `length` is zero, this is a no-op.
     *
     * NOTE: to add without discarding old values, always call setSize first.
     */
    add(val) {
        if (this.length) {
            const clone = JSON.parse(JSON.stringify(val)); // TODO: need this?
            // Modular subtraction by 1.
            this.offset = (this.offset + this.length - 1) % this.length;
            this.circularBuffer[this.offset] = clone;
        }
    }
    setSize(size) {
        const newBuffer = [];
        for (let i = 0; i < size; i++) {
            newBuffer.push(this.get(i));
        }
        this.circularBuffer = newBuffer;
        this.offset = 0;
    }
}
class SignalProcessingContext {
    constructor(inputMemory, outputMemory, { windowSize, currentTime, frameIndex, sampleRate, channelIndex = undefined, sampleIndex = undefined }) {
        this.inputMemory = inputMemory;
        this.outputMemory = outputMemory;
        this.maxInputLookback = 0;
        this.maxOutputLookback = 0;
        this.fixedInputLookback = undefined;
        this.fixedOutputLookback = undefined;
        this.currentTime = currentTime + (sampleIndex / sampleRate);
        this.windowSize = windowSize;
        this.sampleIndex = sampleIndex;
        this.channelIndex = channelIndex;
        this.frameIndex = frameIndex;
        this.sampleRate = sampleRate;
    }
    previousInputs(t = 0) {
        this.maxInputLookback = Math.max(t + 1, this.maxInputLookback);
        return this.inputMemory.get(t);
    }
    previousOutput(t = 0) {
        this.maxOutputLookback = Math.max(t + 1, this.maxOutputLookback);
        return this.outputMemory.get(t);
    }
    setOutputMemorySize(n) {
        this.fixedOutputLookback = n;
    }
    setInputMemorySize(n) {
        this.fixedInputLookback = n;
    }
    execute(fn, inputs) {
        // Execute the function, making the Context properties and methods available
        // within the user-supplied function.
        const output = fn.bind(this)(...inputs);
        // If the function tried to access past inputs or force-rezised the memory, 
        // resize.
        SignalProcessingContext.resizeMemory(this.inputMemory, this.maxInputLookback, this.fixedInputLookback);
        SignalProcessingContext.resizeMemory(this.outputMemory, this.maxOutputLookback, this.fixedOutputLookback);
        // Update memory after resizing.
        this.inputMemory.add(inputs);
        this.outputMemory.add(output);
        return output;
    }
    static resizeMemory(memory, maxLookback, lookbackOverride) {
        if (lookbackOverride != undefined) {
            memory.setSize(lookbackOverride);
        }
        else if (maxLookback > memory.length) {
            memory.setSize(maxLookback);
        }
    }
}
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
/********** Worklet-specific code ************/
export const WORKLET_NAME = "function-worklet";
/* Define AudioWorkletProcessor (if in Worklet) */
if (typeof AudioWorkletProcessor != 'undefined') {
    function deserializeWorkletMessage(message) {
        const innerFunction = new Function('return ' + message.fnString)();
        const applyToChunk = getProcessingFunction(message.dimension);
        const contextFactory = new SignalProcessingContextFactory(Object.assign(Object.assign({}, message), { 
            // Reference global variables.
            sampleRate, getCurrentTime: () => currentTime, getFrameIndex: () => Math.floor(currentFrame / message.windowSize) }));
        return function processFn(inputs, outputs, __parameters) {
            // Apply across dimensions.
            applyToChunk(innerFunction, inputs, outputs[0], contextFactory);
        };
    }
    class OperationWorklet extends AudioWorkletProcessor {
        constructor() {
            super();
            // Receives serialized input sent from postMessage() calls.
            // This is used to change the processing function at runtime.
            this.port.onmessage = (event) => {
                this.processImpl = deserializeWorkletMessage(event.data);
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
