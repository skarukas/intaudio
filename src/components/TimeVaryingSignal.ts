import { StreamSpec } from "../shared/StreamSpec.js"
import { TimeMeasure } from "../shared/types.js"
import { defineTimeRamp } from "../shared/util.js"
import { AudioTransformComponent } from "./AudioTransformComponent.js"

export class TimeVaryingSignal extends AudioTransformComponent {
  static TimeMeasure = TimeMeasure
  constructor(
    generatorFn: (t: number) => number,
    timeMeasure: TimeMeasure = TimeMeasure.SECONDS
  ) {
    super(
      generatorFn,
      { inputSpec: new StreamSpec({ numChannelsPerStream: [1] }) }
    )
    const timeRamp = defineTimeRamp(this.audioContext, timeMeasure)
    timeRamp.connect(this.executionContext.inputs[0].node as any)
    this.preventIOOverwrites()
  }
}