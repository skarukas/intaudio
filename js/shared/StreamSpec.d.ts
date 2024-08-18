import { IODatatype } from "../worklet/lib/FrameToSignatureConverter.js";
type IterableArray<T> = ArrayLike<T> & Iterable<T>;
declare abstract class ArrayFunctionality<T> implements IterableArray<T> {
    length: number;
    readonly [n: number]: T;
    constructor(length: number);
    [Symbol.iterator](): Iterator<T, any, undefined>;
    protected abstract getItem(i: number): T;
}
/**
 * Specifies a configuration of inputs / outputs grouped into channels and the name of each one.
 *
 */
export declare class TypedStreamSpec extends ArrayFunctionality<{
    name: string | number;
    type: IODatatype;
    numChannels?: number;
}> {
    hasNumberedNames: boolean;
    hasDefaultNumChannels: boolean;
    names: (string | number)[];
    numChannelsPerStream: number[];
    types: IODatatype[];
    constructor({ names, numStreams, numChannelsPerStream, types }: {
        names?: (string | number)[];
        numStreams?: number;
        numChannelsPerStream?: number[];
        types?: (IODatatype | string)[];
    });
    static fromSerialized(streamSpec: TypedStreamSpec): TypedStreamSpec;
    protected getItem(i: number): {
        name: string | number;
        numChannels: number;
        type: IODatatype;
    };
    get totalNumChannels(): number;
    protected infoFromNames(names: (string | number)[]): {
        numChannelsPerStream: number[];
        numStreams: number;
    };
    protected infoFromNumStreams(numStreams: number): {
        numChannelsPerStream: number[];
        names: (string | number)[];
    };
    protected infoFromChannelsPerStream(numChannelsPerStream: number[]): {
        numStreams: number;
        names: (string | number)[];
    };
    toString(): string;
}
export declare class StreamSpec extends TypedStreamSpec implements ArrayFunctionality<{
    name: string | number;
    numChannels?: number;
    type?: IODatatype;
}> {
    constructor({ names, numStreams, numChannelsPerStream }: {
        names?: (string | number)[];
        numStreams?: number;
        numChannelsPerStream?: number[];
    });
}
export {};
