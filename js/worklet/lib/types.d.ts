export type AudioDimension = "all" | "none" | "channels" | "time";
export type MultiChannelArray<T> = ArrayLike<T> & {
    get left(): T;
    get right(): T;
};
export type ArrayLike<T> = {
    length: number;
    [idx: number]: T;
};
export type SignalProcessingFnInput<D> = (D extends "all" ? MultiChannelArray<ArrayLike<number>> : (D extends "channels" ? MultiChannelArray<number> : (D extends "time" ? ArrayLike<number> : number)));
export declare function toMultiChannelArray<T>(array: ArrayLike<T>): MultiChannelArray<T>;
