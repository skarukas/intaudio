import { TimeMeasure } from "../shared/types.js";
import { AudioTransformComponent } from "./AudioTransformComponent.js";
export declare class TimeVaryingSignal extends AudioTransformComponent {
    static TimeMeasure: typeof TimeMeasure;
    constructor(generatorFn: (t: number) => number, timeMeasure?: TimeMeasure);
}
