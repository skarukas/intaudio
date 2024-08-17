import { isType, range, zip } from "../../shared/util.js";
import { toMultiChannelArray } from "./types.js";
import { isArrayLike, isCorrectOutput, map, mapOverChannels } from "./utils.js";
import { ArrayView } from "./views.js";
// NOTE: IODatatypes always process one channel at a time.
export class IODatatype {
    constructor() {
        this.name = this.constructor.name;
    }
    toString() {
        return `${this.name} (${this.dataspecString})`;
    }
    static create(dtype, name) {
        switch (dtype.toLowerCase()) {
            case "fft":
            case "stft":
                return new stft();
            case "audio":
                return new audio();
            case "control":
                return new control(name);
            default:
                throw new Error(`Unrecognized dtype ${dtype}. Supported datatypes: ['stft', 'audio', 'control']`);
        }
    }
}
export class stft extends IODatatype {
    constructor(windowSize) {
        super();
        this.windowSize = windowSize;
        this.dataspecString = '{ magnitude: ArrayLike<number>, phase: ArrayLike<number> }';
        this.numAudioStreams = 3;
    }
    channelFromAudioData(frame) {
        if (!isType(frame.audioStreams[0], Array)) {
            throw new Error("STFT data must be arrays.");
        }
        // NOTE: Ignore the first audio stream (sync).
        return {
            magnitude: frame.audioStreams[1],
            phase: frame.audioStreams[2]
            // Other FFT traits to give the user?
        };
    }
    __NEW__validateAny(value) {
        return value.magnitude != undefined && value.phase != undefined;
    }
    __NEW__toAudioData(value, sampleIndex) {
        const sync = sampleIndex == undefined ?
            range(value.magnitude.length)
            : sampleIndex;
        return {
            audioStreams: [
                sync,
                value.magnitude,
                value.phase
            ]
        };
    }
    __OLD__validate(value, { checkLength }) {
        if (value == undefined) {
            throw new Error("Expected STFT data, got undefined.");
        }
        if (value.magnitude == undefined || value.phase == undefined) {
            throw new Error("STFT data must have keys magnitude and phase. Given: " + value);
        }
        for (let key of ["magnitude", "phase"]) {
            const arr = value[key];
            if (!isArrayLike(value)) {
                throw new Error(`Each STFT value must be an ArrayLike collection of numbers. Given ${key} value with no length property or numeric values.`);
            }
            if (checkLength && arr.length != this.windowSize) {
                throw new Error(`Returned size must be equal to the input FFT windowSize. Expected ${this.windowSize}, given ${key}.length=${arr.length}.`);
            }
        }
    }
    __OLD__channelToAudioData(value) {
        return {
            audioStreams: [
                range(value.magnitude.length), // sync signal.
                value.magnitude,
                value.phase
            ].map(toMultiChannelArray)
        };
    }
}
export class audio extends IODatatype {
    constructor() {
        super(...arguments);
        this.dataspecString = 'ArrayLike<number>';
        this.numAudioStreams = 1;
    }
    __NEW__validateAny(value) {
        return isType(value, Number) || isArrayLike(value);
    }
    __NEW__toAudioData(value, sampleIndex) {
        throw new Error("Method not implemented.");
    }
    __OLD__validate(channel) {
        if (!isArrayLike(channel)) {
            throw new Error(`Each audio channel must be an ArrayLike collection of numbers. Given value with no length property or numeric values.`);
        }
        if (channel[0] != undefined && !isType(channel[0], Number)) {
            throw new Error(`Audio data must be numbers, given ${channel} (typeof ${typeof channel})`);
        }
    }
    channelFromAudioData(frame) {
        return frame.audioStreams[0];
    }
    __OLD__channelToAudioData(channel) {
        if (!(channel instanceof Array)) {
            throw new Error(`Audio data must be an array, given type ${typeof channel}.`);
        }
        channel = channel.map(v => isFinite(+v) ? v : 0);
        return {
            audioStreams: [toMultiChannelArray(channel)]
        };
    }
}
export class control extends IODatatype {
    __NEW__validateAny(value) {
        throw new Error("control is not a valid return type.");
    }
    __NEW__toAudioData(value, sampleIndex) {
        throw new Error("control is not a valid return type.");
    }
    __OLD__validate(value) {
        throw new Error("control is not a valid return type.");
    }
    constructor(parameterKey) {
        super();
        this.parameterKey = parameterKey;
        this.dataspecString = 'any';
        this.numAudioStreams = 0;
    }
    channelFromAudioData(frame) {
        if (frame.parameters == undefined) {
            throw new Error(`undefined parameters, expected key ${this.parameterKey}`);
        }
        return frame.parameters[this.parameterKey];
    }
    __OLD__channelToAudioData(value) {
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
    constructor(dimension, inputSpec, outputSpec) {
        this.dimension = dimension;
        this.inputSpec = inputSpec;
        this.outputSpec = outputSpec;
    }
    /**
     * Convert raw audio frame data into user-friendly function inputs.
     */
    prepareInputs(frame) {
        // TODO: fix this function.
        let streamIndex = 0;
        const inputs = [];
        for (const { type } of this.inputSpec) {
            // TODO: figure out how to pass multiple streams to a channel...
            const inputStreams = ArrayView.createSliceView(frame.audioStreams, streamIndex, streamIndex + type.numAudioStreams);
            const input = mapOverChannels(this.dimension, frame.audioStreams, channel => {
                type.channelFromAudioData({
                    audioStreams: inputStreams,
                    parameters: frame.parameters
                });
            });
            inputs.push(input);
        }
        return inputs;
    }
    normalizeOutputs(outputs) {
        // try-catch led to terrible performance, using validation instead.
        const originalErrors = this.validateOutputs(outputs);
        if (!originalErrors.length) {
            return outputs;
        }
        outputs = [outputs];
        const arrayErrors = this.validateOutputs(outputs);
        if (!arrayErrors.length) {
            return outputs;
        }
        throw new Error(`Unable to read outputs from processing function due to the following error(s):
${originalErrors.map(v => " - " + v).join("\n")}

Attempted to wrap output in an array, which failed as well:
${arrayErrors.map(v => " - " + v).join("\n")}`);
    }
    validateOutputs(outputs) {
        if (!isArrayLike(outputs)) {
            return [`Expected function outputs to be an array with the signature [${this.outputSpec}] but got '${typeof outputs}' type instead.`];
        }
        if (outputs.length != this.outputSpec.length) {
            return [`Expected the function to have ${this.outputSpec.length} output(s), expressed as an array with length ${this.outputSpec.length}, but got array of length ${outputs.length} instead.`];
        }
        return map(outputs, (v, i) => {
            const spec = this.outputSpec[i];
            // TODO: account for different dimension in datatype string.
            if (!isCorrectOutput(this.dimension, v, spec.type)) {
                return `Error parsing output ${i} ('${spec.name}') of function with dimension='${this.dimension}'. Expected datatype ${spec.type}, given ${v}.`;
            }
            return '';
        }).filter(v => !!v);
    }
    __OLD__validateOutputs(outputs) {
        if (!isArrayLike(outputs)) {
            throw new Error(`Expected function outputs to be an array with the signature [${this.outputSpec}] but got '${typeof outputs}' type instead.`);
        }
        if (outputs.length != this.outputSpec.length) {
            throw new Error(`Expected function outputs to be an array with size ${this.outputSpec.length} but got size ${outputs.length} instead.`);
        }
        const itOutputs = ArrayView.createSliceView(outputs);
        const checkLength = ["all", "time"].includes(this.dimension);
        for (const [output, spec] of zip(itOutputs, this.outputSpec)) {
            try {
                mapOverChannels(this.dimension, output, channel => spec.type.__OLD__validate(channel, { checkLength }));
            }
            catch (e) {
                e.message = `Error parsing output '${spec.name}' with expected datatype ${spec.type}. ${e.message}`;
                throw e;
            }
        }
    }
    /**
     * Convert user output back into raw data.
     */
    processOutputs(outputs) {
        const outputAudioStreamParts = [];
        for (const [output, specEntry] of zip(outputs, this.outputSpec)) {
            try {
                const streams = this.outputToAudioStreams(output, specEntry.type);
                outputAudioStreamParts.push(streams);
            }
            catch (e) {
                throw new Error(`Expected function outputs to be an array with the signature [${this.outputSpec}] but unable to convert output '${specEntry.name}' to the expected type (${specEntry.type}): ${e.message}`);
            }
        }
        return {
            audioStreams: ArrayView.createConcatView(...outputAudioStreamParts)
        };
    }
    outputToAudioStreams(output, type) {
        const audioStreams = [];
        // Because channelToAudioData can return multiple streams, we have to do 
        // some funny business. The large dimension returned at the "channel" level 
        // needs to be pushed to the topmost dimension (output level).
        const channelByAudioStream = range(type.numAudioStreams).fill([]);
        // 1. Collect flattened output by audioStream index.
        mapOverChannels(this.dimension, output, channel => {
            // TODO: how to handle parameters? Are output parameters allowed?
            const data = type.__OLD__channelToAudioData(channel);
            for (const i of range(type.numAudioStreams)) {
                channelByAudioStream[i].push(data.audioStreams[i]);
            }
        });
        // 2. For each audioStream index, create a top-level audioStream by reading 
        // from the flattened array.
        for (const i of range(type.numAudioStreams)) {
            let j = 0; // Indexes the "flattened" array.
            const stream = mapOverChannels(this.dimension, output, _ => channelByAudioStream[i][j++]);
            audioStreams.push(stream);
        }
        return audioStreams;
    }
}
