import { toMultiChannelArray } from "./types.js";
export const IS_WORKLET = typeof AudioWorkletProcessor != 'undefined';
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
        const context = contextFactory.getContext({ sampleIndex: i });
        const outputChannels = context.execute((...inputs) => fn(...inputs).map(v => isFinite(v) ? v : 0), inputs);
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
/**
 * Computes x mod y.
 */
export function mod(x, y) {
    return ((x % y) + y) % y;
}
function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}
/* Safe version of TypedArray.set that doesn't throw RangeError. */
function safeArraySet(dest, source, offset) {
    if (source.length + offset > dest.length) {
        for (let i = 0; i + offset < dest.length; i++) {
            dest[i + offset] = source[i];
        }
    }
    else {
        dest.set(source, offset);
    }
}
export function joinTypedArrays(buffers, ArrayType = Float32Array, maxLength = Infinity) {
    const lengths = buffers.map(a => a.length);
    const outSize = Math.min(maxLength, sum(lengths));
    const result = new ArrayType(outSize);
    let currOffset = 0;
    for (let i = 0; i < buffers.length; i++) {
        if (currOffset >= outSize)
            break;
        safeArraySet(result, buffers[i], currOffset);
        currOffset += lengths[i];
    }
    return result;
}
export function toComplexArray(real, imaginary, complexOut) {
    complexOut !== null && complexOut !== void 0 ? complexOut : (complexOut = Array(real.length * 2).fill(0));
    for (let i = 0; i < real.length; i++) {
        complexOut[i * 2] = real[i];
        imaginary && (complexOut[i * 2 + 1] = imaginary[i]);
    }
    return complexOut;
}
export function splitComplexArray(complexArray, outReal, outImaginary) {
    const fftSize = complexArray.length / 2;
    outReal !== null && outReal !== void 0 ? outReal : (outReal = new Float32Array(fftSize));
    outImaginary !== null && outImaginary !== void 0 ? outImaginary : (outImaginary = new Float32Array(fftSize));
    for (let i = 0; i < fftSize; i++) {
        outReal[i] = complexArray[i * 2];
        outImaginary[i] = complexArray[i * 2 + 1];
    }
    return { real: outReal, imaginary: outImaginary };
}
export function carToPol(real, imag) {
    return {
        magnitude: Math.sqrt(real * real + imag * imag),
        // Math.atan(imag / real) leads to non-invertible polar coordinates.
        phase: Math.atan2(imag, real)
    };
}
export function carToPolArray(real, imag, magnitude, phase) {
    magnitude !== null && magnitude !== void 0 ? magnitude : (magnitude = new Float32Array(real.length));
    phase !== null && phase !== void 0 ? phase : (phase = new Float32Array(real.length));
    for (let i = 0; i < real.length; i++) {
        const polar = carToPol(real[i], imag[i]);
        magnitude[i] = polar.magnitude;
        phase[i] = polar.phase;
    }
    return { magnitude, phase };
}
export function polToCar(magnitude, phase) {
    return {
        real: magnitude * Math.cos(phase),
        imaginary: magnitude * Math.sin(phase)
    };
}
export function polToCarArray(magnitude, phase, real, imaginary) {
    real !== null && real !== void 0 ? real : (real = new Float32Array(magnitude.length));
    imaginary !== null && imaginary !== void 0 ? imaginary : (imaginary = new Float32Array(magnitude.length));
    for (let i = 0; i < real.length; i++) {
        const cartesian = polToCar(magnitude[i], phase[i]);
        real[i] = cartesian.real;
        imaginary[i] = cartesian.imaginary;
    }
    return { real, imaginary };
}
export function getChannel(arr, c) {
    return arr[c % arr.length];
}
export function map2d(grid, fn) {
    return grid.map((arr, i) => arr.map((v, j) => fn(v, i, j)));
}
