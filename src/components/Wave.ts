import { AudioRateInput } from "../internals.js"
import { ControlInput } from "../io/input/ControlInput.js"
import { AudioRateOutput } from "../io/output/AudioRateOutput.js"
import { WaveType } from "../shared/types.js"
import { BaseComponent } from "./base/BaseComponent.js"


export class Wave extends BaseComponent {
  type: ControlInput<WaveType>
  waveTable: ControlInput<PeriodicWave>
  frequency: AudioRateInput
  output: AudioRateOutput
  private _oscillatorNode: OscillatorNode

  static Type = WaveType
  constructor(
    wavetableOrType: PeriodicWave | WaveType,
    frequency: number
  ) {
    super()
    let waveType: WaveType,
      wavetable: PeriodicWave;
    if (wavetableOrType instanceof PeriodicWave) {
      wavetable = wavetableOrType
      waveType = WaveType.CUSTOM
    } else if (Object.values(Wave.Type).includes(wavetableOrType)) {
      waveType = wavetableOrType
    }
    this._oscillatorNode = new OscillatorNode(this.audioContext, {
      type: waveType,
      frequency: frequency,
      periodicWave: wavetable
    })
    this._oscillatorNode.start()
    this.type = this.defineControlInput('type', waveType)
    this.waveTable = this.defineControlInput('waveTable', wavetable)
    this.frequency = this.defineAudioInput('frequency', this._oscillatorNode.frequency)

    this.output = this.defineAudioOutput('output', this._oscillatorNode)
  }
  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    if (input == this.waveTable) {
      this._oscillatorNode.setPeriodicWave(newValue)
    } else if (input == this.type) {
      // TODO: figure this out.
      this._oscillatorNode.type = <OscillatorType>newValue
    }
  }
  static fromPartials(
    frequency: number,
    magnitudes: Array<number>,
    phases?: Array<number>
  ) {
    let realCoefficients = []
    let imagCoefficients = []
    for (let i = 0; i < magnitudes.length; i++) {
      let theta = (phases && phases[i]) ? phases[i] : 0
      let r = magnitudes[i]
      realCoefficients.push(r * Math.cos(theta))
      imagCoefficients.push(r * Math.sin(theta))
    }
    // this == class in static contexts.
    return this.fromCoefficients(frequency, realCoefficients, imagCoefficients)
  }
  static fromCoefficients(
    frequency: number,
    real: Iterable<number>,
    imaginary?: Iterable<number>
  ) {
    const wavetable = this.audioContext.createPeriodicWave(real, imaginary)
    return new this._.Wave(wavetable, frequency)
  }
}
