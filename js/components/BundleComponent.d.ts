import { AbstractInput } from "../io/input/AbstractInput.js";
import { ComponentInput } from "../io/input/ComponentInput.js";
import { CompoundInput } from "../io/input/CompoundInput.js";
import { AbstractOutput } from "../io/output/AbstractOutput.js";
import { CompoundOutput } from "../io/output/CompoundOutput.js";
import { Connectable } from "../shared/base/Connectable.js";
import { CanBeConnectedTo, KeysLike, ObjectOf } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
import { Component } from "./base/Component.js";
/**
 * Represents a group of components that can be operated on independently.
 */
export declare class BundleComponent<ComponentDict extends ObjectOf<Component>> extends BaseComponent implements Component, Iterable<Component> {
    protected componentObject: ObjectOf<Component>;
    protected componentValues: Component[];
    input: CompoundInput<KeysLike<ComponentDict, AbstractInput>>;
    output: CompoundOutput<KeysLike<ComponentDict, AbstractOutput>>;
    length: number;
    constructor(components: ComponentDict | Array<Component>);
    get isControlStream(): boolean;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    [Symbol.iterator](): Iterator<Component>;
    getDefaultInput(): ComponentInput<unknown>;
    get defaultOutput(): undefined;
    get numOutputChannels(): number;
    get numInputChannels(): number;
    setBypassed(isBypassed?: boolean): void;
    setMuted(isMuted?: boolean): void;
    protected getBundledResult(fnName: string, ...inputs: any[]): BundleComponent<ObjectOf<any>>;
    connect<T extends CanBeConnectedTo>(destination: T): Component;
    withInputs(inputDict: {
        [name: string]: Connectable;
    }): this;
    setValues(valueObj: any): BundleComponent<ObjectOf<any>>;
    wasConnectedTo<T>(source: AbstractOutput<T>): AbstractOutput<T>;
    sampleSignal(samplePeriodMs?: number): Component;
    propagateUpdatedInput<T>(input: AbstractInput<T>, newValue: T): BundleComponent<ObjectOf<any>>;
}
