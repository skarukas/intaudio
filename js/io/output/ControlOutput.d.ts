import { Component } from "../../components/base/Component.js";
import { CanBeConnectedTo } from "../../shared/types.js";
import { AbstractOutput } from "./AbstractOutput.js";
export declare class ControlOutput<T> extends AbstractOutput<T> {
    numOutputChannels: number;
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    setValue(value: T | Promise<T>, rawObject?: boolean): void;
    onUpdate(callback: (val?: T) => void): void;
}
