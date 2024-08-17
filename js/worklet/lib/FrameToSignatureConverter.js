import { enumerate, isType, zip } from "../../shared/util.js";
import { ArrayView } from "./views.js";
class IODatatype {
    toString() {
        return this.constructor.name;
    }
}
class STFT extends IODatatype {
    constructor(windowSize) {
        super();
        this.windowSize = windowSize;
        this.numAudioStreams = 3;
    }
    fromAudioData(frame) {
        if (!isType(frame.audioStreams[0], Array)) {
            throw new Error("STFT data must be arrays.");
        }
        // TODO: validate...
        return {
            magnitude: frame.audioStreams[1],
            phase: frame.audioStreams[2]
            // Other FFT traits?
        };
    }
    toAudioData(value) {
        // TODO: validate...
        if (value.magnitude.length != this.windowSize
            && value.phase.length != this.windowSize) {
            throw new Error(`Returned size must be equal to the input FFT windowSize. Expected ${this.windowSize}, given magnitude.length=${value.magnitude.length} and phase.length=${value.phase.length}.`);
        }
        return {
            audioStreams: [
                Array.prototype.map.call(value.magnitude, (v, i) => i),
                value.magnitude,
                value.phase
            ]
        };
    }
}
class Audio extends IODatatype {
    constructor() {
        super(...arguments);
        this.numAudioStreams = 1;
    }
    fromAudioData(frame) {
        return frame.audioStreams[0];
    }
    toAudioData(value) {
        if (!(value instanceof Array)) {
            throw new Error(`Audio data must be an array, given type ${typeof value}.`);
        }
        return { audioStreams: [value] };
    }
}
class Control extends IODatatype {
    constructor(parameterKey) {
        super();
        this.parameterKey = parameterKey;
        this.numAudioStreams = 0;
    }
    fromAudioData(frame) {
        if (frame.parameters == undefined) {
            throw new Error(`undefined parameters, expected key ${this.parameterKey}`);
        }
        return frame.parameters[this.parameterKey];
    }
    toAudioData(value) {
        // TODO: how would someone specify the output name?
        return {
            audioStreams: [],
            parameters: { [this.parameterKey]: value }
        };
    }
}
// TODO: use named outputs.
/**
 * Converts a frame of audio data + metadata to and from function I/O types exposed to the user-defined function. The frame may be of any dimension.
 */
export class FrameToSignatureConverter {
    constructor(inputSignature, outputSignature) {
        this.inputSignature = inputSignature;
        this.outputSignature = outputSignature;
    }
    /**
     * Convert raw audio frame data into user-friendly function inputs.
     */
    prepareInputs(frame) {
        let streamIndex = 0;
        const inputs = [];
        for (const inputType of this.inputSignature) {
            const inputStreams = ArrayView.createSliceView(frame.audioStreams, streamIndex, streamIndex + inputType.numAudioStreams);
            inputs.push(inputType.fromAudioData({
                audioStreams: inputStreams,
                parameters: frame.parameters
            }));
        }
        return inputs;
    }
    /**
     * Convert user output back into raw data.
     */
    processOutputs(outputs) {
        if (!isType(outputs, Array)) {
            if (this.outputSignature.length == 1) {
                // This is an edge case that is allowed--the user returns a single value
                // where an array of size 1 is expected.
                outputs = [outputs];
            }
            else {
                throw new Error(`Expected function outputs to be an array with the signature [${this.outputSignature}] but got '${typeof outputs}' type instead.`);
            }
        }
        if (outputs.length != this.outputSignature.length) {
            throw new Error(`Expected function outputs to be an array with size ${this.outputSignature.length} but got size ${outputs.length} instead.`);
        }
        const outputAudioStreamParts = [];
        const outputParams = {};
        for (const [i, [output, outputType]] of enumerate(zip(outputs, this.outputSignature))) {
            try {
                const frame = outputType.toAudioData(output);
                outputAudioStreamParts.push(frame.audioStreams);
                Object.assign(outputParams, frame.parameters);
            }
            catch (e) {
                throw new Error(`Expected function outputs to be an array with the signature [${this.outputSignature}] but output ${i} did not match the expected type (${outputType}): ${e.message}`);
            }
        }
        return {
            audioStreams: ArrayView.createConcatView(...outputAudioStreamParts),
            parameters: outputParams
        };
    }
}
