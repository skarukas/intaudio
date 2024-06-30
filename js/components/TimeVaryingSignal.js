import { createConstantSource } from "../shared/util.js";
import { FunctionComponent } from "./FunctionComponent.js";
var TimeMeasure;
(function (TimeMeasure) {
    TimeMeasure["CYCLES"] = "cycles";
    TimeMeasure["SECONDS"] = "seconds";
})(TimeMeasure || (TimeMeasure = {}));
export class TimeVaryingSignal extends FunctionComponent {
    constructor(generatorFn, timeMeasure = TimeMeasure.SECONDS) {
        super(generatorFn);
        if (this._orderedFunctionInputs.length != 1) {
            throw new Error(`A time-varying signal function can only have one argument. Given ${this.fn}`);
        }
        const timeRamp = this.defineTimeRamp(timeMeasure);
        timeRamp.connect(this.channelMerger, 0, 0);
        this._preventIOOverwrites();
    }
    defineTimeRamp(timeMeasure) {
        // Continuous ramp representing the AudioContext time.
        let multiplier = timeMeasure == TimeMeasure.CYCLES ? 2 * Math.PI : 1;
        let timeRamp = createConstantSource(this.audioContext);
        let currTime = this._now();
        let endTime = 1e8;
        timeRamp.offset.setValueAtTime(multiplier * currTime, currTime);
        timeRamp.offset.linearRampToValueAtTime(multiplier * endTime, endTime);
        return timeRamp;
    }
}
TimeVaryingSignal.TimeMeasure = TimeMeasure;
