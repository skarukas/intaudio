import { Component } from "../../components/base/Component.js";
import { BaseConnectable } from "../../shared/base/BaseConnectable.js";
import { Constructor, ObjectOf } from "../../shared/types.js";
import { HasTypeValidator } from "../HasTypeValidator.js";
import { AbstractInput } from "../input/AbstractInput.js";
export declare abstract class AbstractOutput<T = any> extends BaseConnectable implements HasTypeValidator {
    name: string | number;
    parent?: Component | undefined;
    protected validate: (value: any) => void;
    constructor(name: string | number, parent?: Component | undefined);
    connections: ObjectOf<AbstractInput>;
    abstract get numOutputChannels(): number;
    callbacks: Array<(val?: T) => void>;
    ofType(type: Constructor | string): this;
    toString(): string;
    get defaultOutput(): AbstractOutput | undefined;
    /**
     * The validator function can either throw an error or return false.
     */
    withValidator(validatorFn: (v: any) => boolean | void): this;
}
