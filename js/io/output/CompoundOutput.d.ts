import { Component } from "../../components/base/Component.js";
import { CanBeConnectedTo, KeysLike, MultiChannel, ObjectOf } from "../../shared/types.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
import { AbstractInput } from "../input/AbstractInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
type OutputTypes<T> = {
    [K in keyof T]: T[K] extends AbstractOutput<infer Inner> ? Inner : unknown;
};
export declare class CompoundOutput<OutputsDict extends ObjectOf<AbstractOutput>> extends AbstractOutput<OutputTypes<OutputsDict>> implements MultiChannel<AbstractOutput> {
    name: string | number;
    parent?: Component | undefined;
    connect<T extends Component>(destination: T): T;
    connect<T extends CanBeConnectedTo>(destination: T): Component;
    disconnect(destination?: Component | AbstractInput): void;
    channels: MultiChannelArray<this>;
    activeChannel: number | undefined;
    outputs: OutputsDict;
    get keys(): Set<string>;
    get left(): AbstractOutput<any>;
    get right(): AbstractOutput<any>;
    private _defaultOutput;
    get defaultOutput(): AbstractOutput | undefined;
    constructor(name: string | number, outputs: OutputsDict, parent?: Component | undefined, defaultOutput?: AbstractOutput);
    protected mapOverOutputs<T>(fn: (i: AbstractOutput, name: string | number) => T): KeysLike<OutputsDict, T>;
    get numOutputChannels(): number;
}
export {};
