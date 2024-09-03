import { Component } from "../../components/base/Component.js";
import { AbstractInput } from "../../io/input/AbstractInput.js";
import { CanBeConnectedTo } from "../types.js";
export interface Connectable {
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    disconnect(destination?: Component | AbstractInput): void;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    get isControlStream(): boolean;
}
