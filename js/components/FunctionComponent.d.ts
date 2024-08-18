import { Connectable } from "../shared/base/Connectable.js";
import { BaseComponent } from "./base/BaseComponent.js";
import { AnyFn } from "../shared/types.js";
import { AbstractInput } from "../io/input/AbstractInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { ControlOutput } from "../io/output/ControlOutput.js";
export declare class FunctionComponent<T0 = any, T1 = any, T2 = any, T3 = any, T4 = any, T5 = any, R = any> extends BaseComponent {
    fn: AnyFn<T0, T1, T2, T3, T4, T5, R>;
    readonly $0?: ControlInput<T0>;
    readonly $1?: ControlInput<T1>;
    readonly $2?: ControlInput<T2>;
    readonly $3?: ControlInput<T3>;
    readonly $4?: ControlInput<T4>;
    readonly $5?: ControlInput<T5>;
    output: ControlOutput<R>;
    protected _orderedFunctionInputs: Array<ControlInput<any>>;
    constructor(fn: Function);
    constructor(fn: () => R);
    constructor(fn: (a0?: T0) => R);
    constructor(fn: (a0?: T0, a1?: T1) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5) => R);
    constructor(fn: (a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5, ...args: any[]) => R);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    __call__(...inputs: Array<Connectable | unknown>): this;
    __call__(inputDict: {
        [name: string]: Connectable | unknown;
    }): this;
    withInputs(...inputs: Array<Connectable | unknown>): this;
    withInputs(inputDict: {
        [name: string]: Connectable | unknown;
    }): this;
}
declare class HasDynamicInput {
    [key: string]: AbstractInput<unknown>;
}
export declare namespace FunctionComponent {
    type Dynamic = FunctionComponent & HasDynamicInput;
}
export {};
