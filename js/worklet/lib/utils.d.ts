import { KeysLike, ObjectOf } from "../../shared/types.js";
import { IODatatype } from "./FrameToSignatureConverter.js";
import { SignalProcessingContextFactory } from "./SignalProcessingContextFactory.js";
import { ArrayLike, AudioDimension, SignalProcessingFnInput } from "./types.js";
import { WritableArrayLike } from "./views.js";
export declare const IS_WORKLET: boolean;
export type MappingFn<D extends AudioDimension> = (fn: Function, inputs: Float32Array[][], outputs: Float32Array[][], contextFactory: SignalProcessingContextFactory<D>) => number[];
export declare function getProcessingFunction<D extends AudioDimension>(dimension: D): MappingFn<D>;
export declare function mapOverChannels<D extends AudioDimension, R>(dimension: D, data: SignalProcessingFnInput<D>, fn: (x: ArrayLike<number>) => R): KeysLike<SignalProcessingFnInput<D>, R>;
export declare function isCorrectOutput<D extends AudioDimension>(dimension: D, output: SignalProcessingFnInput<D>, type: IODatatype): boolean;
export declare function isArrayLike(value: unknown): boolean;
/**
 * Returns a structure filled with zeroes that represents the shape of a single input or the output.
 */
export declare function generateZeroInput<D extends AudioDimension>(dimension: D, windowSize: number, numChannels: number): SignalProcessingFnInput<D>;
/**
 * Computes x mod y.
 */
export declare function mod(x: number, y: number): number;
export declare function sum(iter: Iterable<number>): number;
export declare function allEqual(iter: Iterable<any>): boolean;
export declare function joinTypedArrays<T extends ArrayLike<any>>(buffers: T[], ArrayType?: any, maxLength?: number): any;
export declare function toComplexArray(real: ArrayLike<number>, imaginary: ArrayLike<number>, complexOut?: ArrayLike<number>): ArrayLike<number>;
export declare function splitComplexArray<T>(complexArray: ArrayLike<number>, outReal?: ArrayLike<any>, outImaginary?: ArrayLike<any>): {
    real: ArrayLike<any>;
    imaginary: ArrayLike<any>;
};
export declare function carToPol(real: number, imag: number): {
    magnitude: number;
    phase: number;
};
export declare function carToPolArray(real: ArrayLike<number>, imag: ArrayLike<number>, magnitude?: ArrayLike<number>, phase?: ArrayLike<number>): {
    magnitude: ArrayLike<number>;
    phase: ArrayLike<number>;
};
export declare function polToCar(magnitude: number, phase: number): {
    real: number;
    imaginary: number;
};
export declare function polToCarArray(magnitude: ArrayLike<number>, phase: ArrayLike<number>, real?: WritableArrayLike<number>, imaginary?: WritableArrayLike<number>): {
    real: WritableArrayLike<number>;
    imaginary: WritableArrayLike<number>;
};
export declare function getChannel<ArrType extends ArrayLike<any>>(arr: ArrayLike<ArrType>, c: number): ArrType;
export declare function map<T, R>(obj: ArrayLike<T>, fn: (v: T, i: number) => R): R[];
export declare function map<T, R>(obj: ObjectOf<T>, fn: (v: T, i: number | string) => R): ObjectOf<R>;
export declare function map2d<T, V>(grid: Array<Array<T>>, fn: (v: T, i: number, j: number) => V): Array<Array<V>>;
export declare const SafeAudioWorkletProcessor: {
    new (): AudioWorkletProcessor;
    prototype: AudioWorkletProcessor;
};
