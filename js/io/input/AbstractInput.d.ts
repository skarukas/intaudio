import { Component } from "../../components/base/Component.js";
import { ToStringAndUUID } from "../../shared/base/ToStringAndUUID.js";
import constants from "../../shared/constants.js";
import { Constructor } from "../../shared/types.js";
import { HasTypeValidator } from "../HasTypeValidator.js";
export declare abstract class AbstractInput<T = any> extends ToStringAndUUID implements HasTypeValidator {
    name: string | number;
    parent: Component | undefined;
    isRequired: boolean;
    protected validate: (value: any) => void;
    constructor(name: string | number, parent: Component | undefined, isRequired: boolean);
    abstract get value(): T | undefined;
    abstract setValue(value: T): void;
    abstract get numInputChannels(): number;
    get defaultInput(): AbstractInput | undefined;
    get isAudioStream(): boolean;
    get isStftStream(): boolean;
    get isControlStream(): boolean;
    __call__(value?: T | typeof constants.TRIGGER): void;
    trigger(): void;
    toString(): string;
    ofType(type: Constructor | string): this;
    /**
     * The validator function can either throw an error or return false.
     */
    withValidator(validatorFn: (v: any) => boolean | void): this;
}
