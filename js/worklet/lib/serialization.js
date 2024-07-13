/* Serialization */
import { SignalProcessingContextFactory } from "./SignalProcessingContextFactory.js";
import { getProcessingFunction } from "./utils.js";
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
export function deserializeWorkletMessage(message, sampleRate, getCurrentTime, getFrameIndex) {
    const innerFunction = new Function('return ' + message.fnString)();
    const applyToChunk = getProcessingFunction(message.dimension);
    const contextFactory = new SignalProcessingContextFactory(Object.assign(Object.assign({}, message), { 
        // Each environment may get this information from different places.
        sampleRate,
        getCurrentTime,
        getFrameIndex }));
    return function processFn(inputs, outputs, __parameters) {
        // Apply across dimensions.
        applyToChunk(innerFunction, inputs, outputs[0], contextFactory);
    };
}
