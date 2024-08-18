import { Constructor, ObjectOf, TimeMeasure } from "./types.js";
export declare function tryWithFailureMessage<T = any>(fn: () => T, message: string): T;
export declare function isPlainObject(value: unknown): boolean;
export declare function createScriptProcessorNode(context: AudioContext, windowSize: number, numInputChannels: number, numOutputChannels: number): ScriptProcessorNode;
export declare function range(n: number): number[];
export declare function enumerate<T>(arr: Iterable<T>): Generator<[number, T]>;
type ZipType<T> = {
    [K in keyof T]: T[K] extends Iterable<infer V> ? V : never;
};
export declare function zip<T extends Iterable<unknown>[]>(...iterables: T): Generator<ZipType<T>>;
export declare function arrayToObject<T = any>(arr: T[]): ObjectOf<T>;
export declare function createConstantSource(audioContext: AudioContext): ConstantSourceNode;
export declare function isComponent(x: any): boolean;
export declare function isFunction(x: any): boolean;
export declare function mapLikeToObject(map: any): any;
/**
 * Scale a value to a new range.
 *
 * @param v The value to scale, where `inMin <= v <= inMax`.
 * @param inputRange An array `[inMin, inMax]` specifying the range the input comes from.
 * @param outputRange An array `[outMin, outMax]` specifying the desired range  of the output.
 * @returns A scaled value `x: outMin <= x <= outMax`.
 */
export declare function scaleRange(v: number, [inMin, inMax]: number[], [outMin, outMax]: number[]): number;
export declare function afterRender(fn: Function): void;
export declare function isAlwaysAllowedDatatype(value: any): boolean;
export declare function wrapValidator(fn: (v: any) => boolean | void): (v: any) => void;
export declare function isType(x: any, types: ((new (...args: any[]) => any) | string)[]): boolean;
export declare function isType<T>(x: any, type: (new (...args: any[]) => T) | string): x is T;
export declare function createTypeValidator(type: Constructor | string): (v: any) => void;
export declare function defineTimeRamp(audioContext: AudioContext, timeMeasure: TimeMeasure, node?: ConstantSourceNode | undefined, mapFn?: (v: number) => number, durationSec?: number): ConstantSourceNode;
export declare function loadFile(audioContext: AudioContext, filePathOrUrl: string): Promise<AudioBuffer>;
export declare function getBufferId(buffer: AudioBuffer): string;
export declare function bufferToFloat32Arrays(buffer: AudioBuffer): Float32Array[];
export declare function makeBufferShared(arr: Float32Array): Float32Array;
export declare function makeAudioBufferShared(buffer: AudioBuffer): void;
export {};
