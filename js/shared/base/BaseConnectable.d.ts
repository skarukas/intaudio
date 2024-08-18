import { Component } from "../../components/base/Component.js";
import { AbstractInput } from "../../io/input/AbstractInput.js";
import { AbstractOutput } from "../../io/output/AbstractOutput.js";
import { CanBeConnectedTo } from "../types.js";
import { Connectable } from "./Connectable.js";
import { ToStringAndUUID } from "./ToStringAndUUID.js";
export declare abstract class BaseConnectable extends ToStringAndUUID implements Connectable {
    abstract connect<T extends Component>(destination: T): T;
    abstract connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    abstract get defaultOutput(): AbstractOutput | undefined;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    get isControlStream(): boolean;
    getDestinationInfo(destination: CanBeConnectedTo): {
        component: Component | undefined;
        input: AbstractInput;
    };
}
