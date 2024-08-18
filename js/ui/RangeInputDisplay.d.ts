import { RangeInputComponent } from "../components/RangeInputComponent.js";
import { BaseDisplay } from "./BaseDisplay.js";
export declare abstract class RangeInputDisplay extends BaseDisplay<RangeInputComponent> {
    updateValue(value: number): void;
    updateMinValue(value: number): void;
    updateMaxValue(value: number): void;
    updateStep(value: number): void;
}
export declare class KnobDisplay extends RangeInputDisplay {
    _display($root: JQuery, width: number, height: number): void;
}
export declare class SliderDisplay extends RangeInputDisplay {
    #private;
    private $range?;
    _display($root: JQuery, width: number, height: number): void;
    updateValue(value: number): void;
    updateMinValue(value: number): void;
    updateMaxValue(value: number): void;
    updateStep(value: number): void;
}
