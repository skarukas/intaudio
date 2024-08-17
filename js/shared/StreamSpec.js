import { audio, IODatatype } from "../worklet/lib/FrameToSignatureConverter.js";
import { map, sum } from "../worklet/lib/utils.js";
import constants from "./constants.js";
import { isType, range } from "./util.js";
class ArrayFunctionality {
    constructor(length) {
        this.length = length;
        for (const i of range(length)) {
            Object.defineProperty(this, i, {
                get() {
                    return this.getItem(i);
                }
            });
        }
    }
    *[Symbol.iterator]() {
        for (const i of range(this.length)) {
            yield this[i];
        }
    }
}
/**
 * Specifies a configuration of inputs / outputs grouped into channels and the name of each one.
 *
 */
export class TypedStreamSpec extends ArrayFunctionality {
    constructor({ names, numStreams, numChannelsPerStream, types }) {
        var _a, _b, _c;
        super((_c = (_b = (_a = numStreams !== null && numStreams !== void 0 ? numStreams : types === null || types === void 0 ? void 0 : types.length) !== null && _a !== void 0 ? _a : names === null || names === void 0 ? void 0 : names.length) !== null && _b !== void 0 ? _b : numChannelsPerStream === null || numChannelsPerStream === void 0 ? void 0 : numChannelsPerStream.length) !== null && _c !== void 0 ? _c : 0);
        types && (numStreams !== null && numStreams !== void 0 ? numStreams : (numStreams = types.length));
        if (names != undefined
            && numStreams != undefined
            && numStreams != names.length
            || numChannelsPerStream != undefined
                && numStreams != undefined
                && numStreams != numChannelsPerStream.length
            || numChannelsPerStream instanceof Array
                && names != undefined
                && numChannelsPerStream.length != names.length) {
            throw new Error(`If provided, numStreams, inputNames, and numChannelsPerStream must match. Given numStreams=${numStreams}, inputNames=${JSON.stringify(names)}, numChannelsPerStream=${numChannelsPerStream}.`);
        }
        // Store whether the names were auto-generated.
        this.hasNumberedNames = names == undefined;
        this.hasDefaultNumChannels = numChannelsPerStream == undefined;
        if (numChannelsPerStream != undefined) {
            const info = this.infoFromChannelsPerStream(numChannelsPerStream);
            numStreams !== null && numStreams !== void 0 ? numStreams : (numStreams = info.numStreams);
            names !== null && names !== void 0 ? names : (names = info.names);
        }
        else if (names != undefined) {
            const info = this.infoFromNames(names);
            numStreams !== null && numStreams !== void 0 ? numStreams : (numStreams = info.numStreams);
            numChannelsPerStream !== null && numChannelsPerStream !== void 0 ? numChannelsPerStream : (numChannelsPerStream = info.numChannelsPerStream);
        }
        else if (numStreams != undefined) {
            const info = this.infoFromNumStreams(numStreams);
            numChannelsPerStream !== null && numChannelsPerStream !== void 0 ? numChannelsPerStream : (numChannelsPerStream = info.numChannelsPerStream);
            names !== null && names !== void 0 ? names : (names = info.names);
        }
        else {
            throw new Error("At least one of (names, numStreams, numChannelsPerStream) must be specified.");
        }
        types !== null && types !== void 0 ? types : (types = names.map(_ => new audio()));
        // These will all be defined at this point.
        this.names = names;
        this.length = numStreams;
        this.numChannelsPerStream = numChannelsPerStream;
        this.types = types.map((v, i) => isType(v, IODatatype) ?
            v
            : IODatatype.create(v, this.names[i]));
    }
    static fromSerialized(streamSpec) {
        const types = streamSpec.types.map(t => t.name);
        return new TypedStreamSpec(Object.assign(Object.assign({}, streamSpec), { types }));
    }
    getItem(i) {
        return {
            name: this.names[i],
            numChannels: this.numChannelsPerStream[i],
            type: this.types[i]
        };
    }
    get totalNumChannels() {
        return sum(Object.values(this.numChannelsPerStream));
    }
    infoFromNames(names) {
        return {
            numStreams: names.length,
            numChannelsPerStream: range(names.length).fill(constants.DEFAULT_NUM_CHANNELS)
        };
    }
    infoFromNumStreams(numStreams) {
        return {
            numChannelsPerStream: range(numStreams).fill(constants.DEFAULT_NUM_CHANNELS),
            names: range(numStreams)
        };
    }
    infoFromChannelsPerStream(numChannelsPerStream) {
        return {
            names: range(numChannelsPerStream.length),
            numStreams: numChannelsPerStream.length
        };
    }
    toString() {
        const specString = map(this, data => {
            let streamString = `'${data.name}': ${data.type.name}`;
            if (data.numChannels) {
                streamString += ` (${data.numChannels} channels)`;
            }
            return streamString;
        }).join(", ");
        return `[${specString}]`;
    }
}
// Audio-only StreamSpec
export class StreamSpec extends TypedStreamSpec {
    constructor({ names, numStreams, numChannelsPerStream }) {
        super({ names, numStreams, numChannelsPerStream });
    }
}
