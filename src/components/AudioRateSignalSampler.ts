import { AudioRateInput } from "../io/input/AudioRateInput.js"
import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { BaseComponent } from "./base/BaseComponent.js"

export class AudioRateSignalSampler extends BaseComponent {
  #interval: number
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
    this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs)
    this.audioInput = this.defineAudioInput('audioInput', this._analyzer)
    this.setDefaultInput(this.audioInput)

    // Output
    this.controlOutput = this.defineControlOutput('controlOutput')
    this.preventIOOverwrites()
  }
  #getCurrentSignalValue(): number {
    const dataArray = new Float32Array(1)
    this._analyzer.getFloatTimeDomainData(dataArray)
    return dataArray[0]
  }
  #setInterval(period: number) {
    this.#interval = window.setInterval(() => {
      try {
        const signal = this.#getCurrentSignalValue()
        this.controlOutput.setValue(signal)
      } catch (e) {
        this.stop()
        throw e
      }
    }, period)
  }
  stop() {
    // TODO: figure out how to actually stop this...
    window.clearInterval(this.#interval)
  }
  inputAdded(input) {
    if (this.#interval) {
      throw new Error("AudioToControlConverter can only have one input.")
    }
    this.#setInterval(this.samplePeriodMs.value)
  }

  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    if (input == this.samplePeriodMs) {
      this.stop()
      this.#setInterval(<number>newValue)
    }
  }
}