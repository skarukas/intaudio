import { ControlInput } from "../io/input/ControlInput.js";
import { ControlOutput } from "../io/output/ControlOutput.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class IgnoreDuplicates<T = any> extends BaseComponent {
    input: ControlInput<T>;
    output: ControlOutput<T>;
    private value;
    constructor();
    protected inputDidUpdate(input: ControlInput<T>, newValue: T): void;
}
