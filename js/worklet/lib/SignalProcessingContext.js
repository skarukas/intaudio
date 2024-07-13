export class SignalProcessingContext {
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
    // TODO: consider making this 1-based to make previousInputs(0) be the current.
    previousInputs(t = 0) {
        // Inputs may be float32 which will not represent an int perfectly.
        t = Math.round(t);
        this.maxInputLookback = Math.max(t + 1, this.maxInputLookback);
        return this.inputMemory.get(t);
    }
    previousOutput(t = 0) {
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
