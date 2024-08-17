import { enumerate, zip } from "../../shared/util.js";
import { ArrayView } from "./views.js";
class IODatatype {
    constructor() {
        this.numAudioStreams = 1;
    }
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
        // TODO: validate...
        const [_, magnitude, phase] = frame.audioStreams;
        return {
            magnitude,
            phase
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
                value.magnitude.map((v, i) => i),
                value.magnitude,
                value.phase
            ]
        };
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
export class OperationTypeConverter {
    constructor(inputSignature, outputSignature) {
        this.inputSignature = inputSignature;
        this.outputSignature = outputSignature;
    }
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
    processOutputs(outputs) {
        if (!(outputs instanceof Array)) {
            if (this.outputSignature.length == 1) {
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
