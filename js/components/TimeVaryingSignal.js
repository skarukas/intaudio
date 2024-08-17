import { StreamSpec } from "../shared/StreamSpec.js";
import { TimeMeasure } from "../shared/types.js";
import { defineTimeRamp } from "../shared/util.js";
import { AudioTransformComponent } from "./AudioTransformComponent.js";
export class TimeVaryingSignal extends AudioTransformComponent {
    constructor(generatorFn, timeMeasure = TimeMeasure.SECONDS) {
        super(generatorFn, { inputSpec: new StreamSpec({ numStreams: 1 }) });
        const timeRamp = defineTimeRamp(this.audioContext, timeMeasure);
        timeRamp.connect(this.executionContext.inputs[0]);
        this.preventIOOverwrites();
        this.output = this.defineOutputAlias('output', this.outputs.$0);
    }
}
TimeVaryingSignal.TimeMeasure = TimeMeasure;
