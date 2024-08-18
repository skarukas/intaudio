import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class AudioRecordingComponent extends BaseComponent {
    [n: number]: AudioRateInput;
    protected worklet: AudioWorkletNode;
    isRecording: boolean;
    protected onMessage: (buffers: AudioBuffer[]) => void;
    protected onFailure: () => void;
    constructor(numberOfInputs?: number);
    capture(numSamples: number): Promise<AudioBuffer[]>;
    start(): void;
    stop(): Promise<AudioBuffer[]>;
    protected waitForWorkletResponse(): Promise<AudioBuffer[]>;
    protected handleMessage(floatData: Float32Array[][]): void;
}
