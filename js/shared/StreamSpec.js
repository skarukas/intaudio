import { sum } from "../worklet/lib/utils.js";
import constants from "./constants.js";
import { range } from "./util.js";
/**
 * Specifies a configuration of inputs / outputs grouped into channels and the name of each one.
 *
 */
export class StreamSpec {
    get totalNumChannels() {
        return sum(Object.values(this.numChannelsPerStream));
    }
    constructor({ names, numStreams, numChannelsPerStream }) {
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
        // These will all be defined at this point.
        this.names = names;
        this.numStreams = numStreams;
        this.numChannelsPerStream = numChannelsPerStream;
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
}
