export class Disconnect extends Error {
}
/**
 * A special Error object that, when thrown within a FunctionComponent, will cause the component to disconnect, but not log the error.
 */
export const disconnect = () => { throw new Disconnect("DISCONNECT"); };
export var WaveType;
(function (WaveType) {
    WaveType["SINE"] = "sine";
    WaveType["SQUARE"] = "square";
    WaveType["SAWTOOTH"] = "sawtooth";
    WaveType["TRIANGLE"] = "triangle";
    WaveType["CUSTOM"] = "custom";
    // TODO: add more
})(WaveType || (WaveType = {}));
export var RangeType;
(function (RangeType) {
    RangeType["SLIDER"] = "slider";
    RangeType["KNOB"] = "knob";
})(RangeType || (RangeType = {}));
export var TimeMeasure;
(function (TimeMeasure) {
    TimeMeasure["CYCLES"] = "cycles";
    TimeMeasure["SECONDS"] = "seconds";
    TimeMeasure["SAMPLES"] = "samples";
})(TimeMeasure || (TimeMeasure = {}));
