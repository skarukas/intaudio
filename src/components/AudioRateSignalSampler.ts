import { AudioRateInput } from "../io/input/AudioRateInput.js"
import { ControlInput } from "../io/input/ControlInput.js"
import { AbstractOutput } from "../io/output/AbstractOutput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { HighResolutionTimer } from "../shared/HighResolutionTimer.js"
import { Disconnect } from "../shared/types.js"
import { BaseComponent } from "./base/BaseComponent.js"

// TODO: make this multi-channel.
export class AudioRateSignalSampler extends BaseComponent {
  private timer: HighResolutionTimer | undefined
  audioInput: AudioRateInput
  samplePeriodMs: ControlInput<number>
  controlOutput: ControlOutput<number>
  private _analyzer: AnalyserNode

  // Utility for converting an audio-rate signal into a control signal.
  constructor(samplePeriodMs?: number) {
    super()
    samplePeriodMs ??= this.config.defaultSamplePeriodMs
    this._analyzer = this.audioContext.createAnalyser()

    // Inputs
    this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs).ofType(Number)
    this.audioInput = this.defineAudioInput('audioInput', this._analyzer)
    this.setDefaultInput(this.audioInput)

    // Output
    this.controlOutput = this.defineControlOutput('controlOutput').ofType(Number)
    this.preventIOOverwrites()
  }
  getCurrentSignalValue(): number {
    const dataArray = new Float32Array(1)
    this._analyzer.getFloatTimeDomainData(dataArray)
    return dataArray[0]
  }
  #setInterval(period: number) {
    this.timer = new HighResolutionTimer(period, () => {
      try {
        const signal = this.getCurrentSignalValue()
        this.controlOutput.setValue(signal)
      } catch (e) {
        this.stop()
        if (!(e instanceof Disconnect)) {
          throw e
        }
      }
    })
    this.timer.run()
  }
  stop() {
    this.timer?.stop()
  }
  inputAdded(source: AbstractOutput<any>) {
    if (this.timer) {
      throw new Error("AudioToControlConverter can only have one input.")
    }
    this.#setInterval(this.samplePeriodMs.value ?? this.config.defaultSamplePeriodMs)
  }

  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    if (input == this.samplePeriodMs) {
      this.stop()
      this.#setInterval(<number>newValue)
    }
  }
}