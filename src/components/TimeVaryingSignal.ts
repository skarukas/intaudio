import { TimeMeasure } from "../shared/types.js"
import { defineTimeRamp } from "../shared/util.js"
import { FunctionComponent } from "./FunctionComponent.js"

export class TimeVaryingSignal extends FunctionComponent {
  static TimeMeasure = TimeMeasure
  constructor(
    generatorFn: (t: number) => number,
    timeMeasure: TimeMeasure = TimeMeasure.SECONDS
  ) {
    super(generatorFn)
    if (this._orderedFunctionInputs.length != 1) {
      throw new Error(`A time-varying signal function can only have one argument. Given ${this.fn}`)
    }
    const timeRamp = defineTimeRamp(this.audioContext, timeMeasure)
    timeRamp.connect(this.channelMerger, 0, 0)
    this.preventIOOverwrites()
  }
}