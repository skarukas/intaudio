/* Serialization */
import { SignalProcessingContextFactory } from "./SignalProcessingContextFactory.js";
import { getProcessingFunction } from "./utils.js";
export function serializeWorkletMessage(f, { dimension, numInputs, numChannelsPerInput, numOutputChannels, windowSize }) {
    const traceback = {};
    Error.captureStackTrace(traceback);
    return {
        fnString: f.toString(),
        dimension,
        numInputs,
        numChannelsPerInput,
        numOutputChannels,
        windowSize,
        tracebackString: traceback['stack']
    };
}
export function deserializeWorkletMessage(message, sampleRate, getCurrentTime, getFrameIndex) {
    const originalTraceback = message.tracebackString;
    const innerFunction = new Function('return ' + message.fnString)();
    const applyToChunk = getProcessingFunction(message.dimension);
    const contextFactory = new SignalProcessingContextFactory(Object.assign(Object.assign({}, message), { 
        // Each environment may get this information from different places.
        sampleRate,
        getCurrentTime,
        getFrameIndex }));
    return function processFn(inputs, outputs, __parameters) {
        try {
            // Apply across dimensions.
            applyToChunk(innerFunction, inputs, outputs[0], contextFactory);
        }
        catch (e) {
            console.error(`Encountered worklet error while processing the following input frame:`);
            console.error(inputs);
            if (e.stack) {
                e.stack = `${e.stack}\n\nMain thread stack trace: ${originalTraceback}`;
            }
            throw e;
        }
    };
}
