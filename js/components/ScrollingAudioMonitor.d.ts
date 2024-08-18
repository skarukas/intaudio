import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { ControlOutput } from "../io/output/ControlOutput.js";
import { ScrollingAudioMonitorDisplay } from "../ui/ScrollingAudioMonitorDisplay.js";
import { VisualComponent } from "./base/VisualComponent.js";
export declare class ScrollingAudioMonitor extends VisualComponent<ScrollingAudioMonitorDisplay> {
    #private;
    display: ScrollingAudioMonitorDisplay;
    hideZeroSignal: ControlInput<boolean>;
    samplePeriodMs: ControlInput<number>;
    memorySize: ControlInput<number>;
    minValue: ControlInput<number | 'auto'>;
    maxValue: ControlInput<number | 'auto'>;
    input: AudioRateInput;
    audioOutput: AudioRateOutput;
    controlOutput: ControlOutput<number[]>;
    _memory: number[][];
    private _analyzers;
    private _splitter;
    private _merger;
    static defaultHeight: number;
    static defaultWidth: number;
    constructor(samplePeriodMs?: number, memorySize?: number, minValue?: number | 'auto', maxValue?: number | 'auto', hideZeroSignal?: boolean, numChannels?: number);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    getCurrentValueRange(): {
        minValue: number;
        maxValue: number;
    };
}
