import { AudioRateInput } from "../internals.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { WaveType } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class Wave extends BaseComponent {
    type: ControlInput<WaveType>;
    waveTable: ControlInput<PeriodicWave>;
    frequency: AudioRateInput;
    output: AudioRateOutput;
    private _oscillatorNode;
    static Type: typeof WaveType;
    constructor(wavetableOrType: PeriodicWave | WaveType, frequency: number);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    static fromPartials(frequency: number, magnitudes: Array<number>, phases?: Array<number>): Wave;
    static fromCoefficients(frequency: number, real: Iterable<number>, imaginary?: Iterable<number>): Wave;
}
