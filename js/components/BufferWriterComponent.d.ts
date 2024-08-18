import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class BufferWriterComponent extends BaseComponent {
    readonly position: AudioRateInput;
    readonly valueToWrite: AudioRateInput;
    readonly buffer: ControlInput<AudioBuffer>;
    protected worklet: AudioWorkletNode;
    constructor(buffer?: AudioBuffer);
    get bufferId(): string;
    setBuffer(buffer: AudioBuffer): void;
    protected handleMessage(floatData: Float32Array[]): void;
}
