import { isType } from "../../shared/util.js";
export class SignalProcessingContext {
    constructor(inputMemory, outputMemory, { windowSize, currentTime, frameIndex, sampleRate, numInputs, numOutputs, channelIndex = undefined, sampleIndex = undefined }) {
        this.inputMemory = inputMemory;
        this.outputMemory = outputMemory;
        this.maxInputLookback = 0;
        this.maxOutputLookback = 0;
        this.fixedInputLookback = -1;
        this.fixedOutputLookback = -1;
        this.currentTime = currentTime + ((sampleIndex !== null && sampleIndex !== void 0 ? sampleIndex : 0) / sampleRate);
        this.windowSize = windowSize;
        this.sampleIndex = sampleIndex;
        this.channelIndex = channelIndex;
        this.frameIndex = frameIndex;
        this.sampleRate = sampleRate;
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
    }
    // TODO: consider making this 1-based to make previousInputs(0) be the current.
    previousInputs(t = 0) {
        // Inputs may be float32 which will not represent an int perfectly.
        t = Math.round(t);
        this.maxInputLookback = Math.max(t + 1, this.maxInputLookback);
        return this.inputMemory.get(t);
    }
    previousOutputs(t = 0) {
        // Inputs may be float32 which will not represent an int perfectly.
        t = Math.round(t);
        this.maxOutputLookback = Math.max(t + 1, this.maxOutputLookback);
        return this.outputMemory.get(t);
    }
    setOutputMemorySize(n) {
        // Inputs may be float32 which will not represent an int perfectly.
        n = Math.round(n);
        this.fixedOutputLookback = n;
    }
    setInputMemorySize(n) {
        // Inputs may be float32 which will not represent an int perfectly.
        n = Math.round(n);
        this.fixedInputLookback = n;
    }
    execute(fn, inputs) {
        // Execute the function, making the Context properties and methods available
        // within the user-supplied function.
        const rawOutput = fn.bind(this)(...inputs);
        // TODO: also fix if rawOutput.length != numOutputs
        const outputs = !isType(rawOutput, Array) || this.numOutputs == 1 && rawOutput.length != 1 ? [rawOutput] : rawOutput;
        // If the function tried to access past inputs or force-rezised the memory, 
        // resize.
        SignalProcessingContext.resizeMemory(this.inputMemory, this.maxInputLookback, this.fixedInputLookback);
        SignalProcessingContext.resizeMemory(this.outputMemory, this.maxOutputLookback, this.fixedOutputLookback);
        // Update memory after resizing.
        this.inputMemory.add(inputs);
        this.outputMemory.add(outputs);
        return outputs;
    }
    static resizeMemory(memory, maxLookback, lookbackOverride) {
        if (lookbackOverride > 0) {
            memory.setSize(lookbackOverride);
        }
        else if (maxLookback > memory.length) {
            memory.setSize(maxLookback);
        }
    }
}
