import { CanBeConnectedTo } from "../../shared/types.js";
import { AudioRateOutput } from "./AudioRateOutput.js";
export declare class HybridOutput<T = any> extends AudioRateOutput {
    connect(destination: CanBeConnectedTo): import("../../components/base/Component.js").Component<import("../../shared/types.js").AnyInput, import("../../shared/types.js").AnyOutput> | undefined;
    setValue(value: T | Promise<T>, rawObject?: boolean): void;
    onUpdate(callback: (val?: any) => void): void;
}
