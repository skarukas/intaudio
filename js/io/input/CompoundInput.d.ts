import { Component } from "../../components/base/Component.js";
import { KeysLike, MultiChannel, ObjectOf } from "../../shared/types.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
import { AbstractInput } from "./AbstractInput.js";
type InputTypes<T> = {
    [K in keyof T]: T[K] extends AbstractInput<infer Inner> ? Inner : unknown;
};
export declare class CompoundInput<InputsDict extends ObjectOf<AbstractInput>> extends AbstractInput<InputTypes<InputsDict>> implements MultiChannel<AbstractInput> {
    name: string | number;
    parent: Component;
    protected _defaultInput: AbstractInput<any> | undefined;
    channels: MultiChannelArray<this>;
    activeChannel: number | undefined;
    inputs: InputsDict;
    get left(): AbstractInput<any>;
    get right(): AbstractInput<any>;
    get keys(): Set<string>;
    get defaultInput(): AbstractInput<any> | undefined;
    constructor(name: string | number, parent: Component, inputs: InputsDict, defaultInput?: AbstractInput);
    protected mapOverInputs<T>(fn: (i: AbstractInput, name: string | number) => T): KeysLike<InputsDict, T>;
    get numInputChannels(): number;
    get value(): InputTypes<InputsDict>;
    setValue(valueDict: InputTypes<InputsDict>): void;
    setValue(valueForDefaultInput: any): void;
}
export {};
