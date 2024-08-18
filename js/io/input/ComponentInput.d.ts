import { BaseComponent } from "../../components/base/BaseComponent.js";
import { AbstractInput } from "./AbstractInput.js";
import { AudioRateInput } from "./AudioRateInput.js";
export declare class ComponentInput<T> extends AudioRateInput {
    name: string | number;
    protected _defaultInput: AbstractInput<T> | undefined;
    get defaultInput(): AbstractInput<T> | undefined;
    constructor(name: string | number, parent: BaseComponent, defaultInput?: AbstractInput<T>);
    setValue(value: any): void;
}
