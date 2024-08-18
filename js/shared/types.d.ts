import { Component } from "../components/base/Component.js";
import { AbstractInput } from "../io/input/AbstractInput.js";
import { AbstractOutput } from "../io/output/AbstractOutput.js";
import { MultiChannelArray } from "../worklet/lib/types.js";
export declare class Disconnect extends Error {
}
/**
 * A special Error object that, when thrown within a FunctionComponent, will cause the component to disconnect, but not log the error.
 */
export declare const disconnect: () => never;
export type CanBeConnectedTo = (Component | WebAudioConnectable | AudioNode | Function | AbstractInput);
export type WebAudioConnectable = AudioParam | AudioNode;
export type AnyInput = {
    [name: string | number | symbol]: AbstractInput;
};
export type AnyOutput = {
    [name: string | number | symbol]: AbstractOutput;
};
export type ObjectOf<T> = {
    [key: number | string]: T;
};
export type ObjectOrArrayOf<T> = T[] | ObjectOf<T>;
export type KeysLike<T, V> = {
    [K in keyof T]: V;
};
export type Bundle<T> = T & {
    [Symbol.iterator](): Iterator<T>;
};
export type Constructor<T = any> = {
    new?(): T;
    name: string;
    [Symbol.hasInstance](x: T): boolean;
};
export type MaybePromise<T> = T | Promise<T>;
export type MaybePromises<T> = {
    [K in keyof T]: MaybePromise<T[K]>;
};
export declare enum WaveType {
    SINE = "sine",
    SQUARE = "square",
    SAWTOOTH = "sawtooth",
    TRIANGLE = "triangle",
    CUSTOM = "custom"
}
export declare enum RangeType {
    SLIDER = "slider",
    KNOB = "knob"
}
export declare enum TimeMeasure {
    CYCLES = "cycles",
    SECONDS = "seconds",
    SAMPLES = "samples"
}
export type AnyFn<T0, T1, T2, T3, T4, T5, ReturnType> = Function | (() => ReturnType) | ((a0?: T0) => ReturnType) | ((a0?: T0, a1?: T1) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5) => ReturnType) | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5, ...args: any[]) => ReturnType);
export interface MultiChannel<T extends (AbstractInput | AbstractOutput) = any> {
    get left(): T;
    get right(): T;
    channels: MultiChannelArray<T>;
    activeChannel: number | undefined;
}
