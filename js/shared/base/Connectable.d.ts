import { Component } from "../../components/base/Component.js";
import { CanBeConnectedTo } from "../types.js";
export interface Connectable {
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    get isControlStream(): boolean;
}
