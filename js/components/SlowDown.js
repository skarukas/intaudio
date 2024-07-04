import { TimeMeasure } from "../shared/types.js";
import { createConstantSource, defineTimeRamp } from "../shared/util.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class SlowDown extends BaseComponent {
    constructor(rate = 1, bufferLengthSec = 60) {
        super();
        this.rate = rate;
        this.bufferLengthSec = bufferLengthSec;
        this.delayNode = this.audioContext.createDelay(bufferLengthSec);
        //this.delayNode.delayTime.setValueAtTime(bufferLengthSec, 0)
        this.delayModulator = createConstantSource(this.audioContext);
        this.delayModulator.connect(this.delayNode.delayTime);
        this.audioInput = this.defineAudioInput('audioInput', this.delayNode);
        this.audioOutput = this.defineAudioOutput('audioOutput', this.delayNode);
        this.rampOut = this.defineAudioOutput('rampOut', this.delayModulator);
    }
    start() {
        defineTimeRamp(this.audioContext, TimeMeasure.SECONDS, this.delayModulator, this.mapFn.bind(this));
    }
    mapFn(v) {
        return v * (1 - this.rate);
    }
}
