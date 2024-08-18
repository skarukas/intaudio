import { Component } from "../../components/base/Component.js";
import { AbstractInput } from "./AbstractInput.js";
export declare class ControlInput<T> extends AbstractInput<T> {
    name: string | number;
    readonly numInputChannels: number;
    _value: T;
    constructor(name: string | number, parent: Component, defaultValue?: T, isRequired?: boolean);
    get value(): T;
    setValue(value: T | Promise<T>): void;
}
