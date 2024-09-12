import { StreamSpec } from "../shared/StreamSpec.js";
import { TimeMeasure } from "../shared/types.js";
import { defineTimeRamp } from "../shared/util.js";
import { AudioTransformComponent } from "./AudioTransformComponent.js";
export class TimeVaryingSignal extends AudioTransformComponent {
    constructor(generatorFn, timeMeasure = TimeMeasure.SECONDS) {
        super(generatorFn, { inputSpec: new StreamSpec({ numChannelsPerStream: [1] }) });
        const timeRamp = defineTimeRamp(this.audioContext, timeMeasure);
        timeRamp.connect(this.executionContext.inputs[0].node);
        this.preventIOOverwrites();
    }
}
TimeVaryingSignal.TimeMeasure = TimeMeasure;
