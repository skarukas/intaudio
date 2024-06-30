// TODO: this has a limited sample rate. Instead, develop an "oscilloscope" 

import { AudioRateInput } from "../io/input/AudioRateInput.js"
import { ControlInput } from "../io/input/ControlInput.js"
import { AudioRateOutput } from "../io/output/AudioRateOutput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { createConstantSource } from "../shared/util.js"
import { ScrollingAudioMonitorDisplay } from "../ui/ScrollingAudioMonitorDisplay.js"
import { AudioRateSignalSampler } from "./AudioRateSignalSampler.js"
import { VisualComponent } from "./base/VisualComponent.js"

// one that captures N samples and displays them all at the same time.
export class ScrollingAudioMonitor extends VisualComponent<ScrollingAudioMonitorDisplay> {
  hideZeroSignal: ControlInput<boolean>
  samplePeriodMs: ControlInput<number>
  memorySize: ControlInput<number>
  minValue: ControlInput<number | 'auto'>
  maxValue: ControlInput<number | 'auto'>
  input: AudioRateInput
  audioOutput: AudioRateOutput
  controlOutput: ControlOutput<number>

  _memory: Array<number>
  private _sampler: AudioRateSignalSampler
  private _passthrough: ConstantSourceNode

  // Display options. TODO: move to display class?
  static defaultHeight = 64;
  static defaultWidth = 256;

  constructor(
    samplePeriodMs?: number,
    memorySize: number = 128,
    minValue: number | 'auto' = 'auto',
    maxValue: number | 'auto' = 'auto',
    hideZeroSignal = true
  ) {
    super()
    samplePeriodMs ??= this.config.defaultSamplePeriodMs
    this.display = new this._.ScrollingAudioMonitorDisplay(this)
    this._sampler = new this._.AudioRateSignalSampler(samplePeriodMs)
    this._passthrough = createConstantSource(this.audioContext)

    // Inputs
    this.samplePeriodMs = this._defineControlInput('samplePeriodMs', samplePeriodMs)
    this.memorySize = this._defineControlInput('memorySize', memorySize)
    this.minValue = this._defineControlInput('minValue', minValue)
    this.maxValue = this._defineControlInput('maxValue', maxValue)
    this.hideZeroSignal = this._defineControlInput('hideZeroSignal', hideZeroSignal)
    this.input = this._defineAudioInput('input', this._passthrough.offset)
    this._setDefaultInput(this.input)

    // Output
    this.audioOutput = this._defineAudioOutput('audioOutput', this._passthrough)
    this.controlOutput = this._defineControlOutput('controlOutput')

    // Routing
    this.audioOutput.connect(this._sampler.audioInput)
    this._sampler.controlOutput.onUpdate((v: number) => {
      this.#addToMemory(v)
      this.display.updateWaveformDisplay()
      this.controlOutput.setValue(v)
    })

    this._memory = Array(this.memorySize.value).fill(0.)
    this._preventIOOverwrites()
  }
  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    if (input == this.memorySize) {
      throw new Error("Can't update memorySize yet.")
    } else if (input == this.samplePeriodMs) {
      this._sampler.samplePeriodMs.setValue(<number>newValue)
    }
  }
  #addToMemory(v: number) {
    this._memory.push(v)
    if (this._memory.length > this.memorySize.value) {
      this._memory.shift()
    }
  }
  getCurrentValueRange(): { minValue: number, maxValue: number } {
    let minValue = this.minValue.value == 'auto' ? Math.min(...this._memory) : this.minValue.value
    let maxValue = this.maxValue.value == 'auto' ? Math.max(...this._memory) : this.maxValue.value
    let isEmptyRange = (minValue == maxValue)
    if (!Number.isFinite(minValue) || isEmptyRange) {
      minValue = -1
    }
    if (!Number.isFinite(maxValue) || isEmptyRange) {
      maxValue = 1
    }
    return { minValue, maxValue }
  }
}