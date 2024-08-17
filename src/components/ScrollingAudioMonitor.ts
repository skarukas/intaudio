// TODO: this has a limited sample rate. Instead, develop an "oscilloscope" 

import { AudioRateInput } from "../io/input/AudioRateInput.js"
import { ControlInput } from "../io/input/ControlInput.js"
import { AudioRateOutput } from "../io/output/AudioRateOutput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { ScrollingAudioMonitorDisplay } from "../ui/ScrollingAudioMonitorDisplay.js"
import { VisualComponent } from "./base/VisualComponent.js"

// one that captures N samples and displays them all at the same time.
export class ScrollingAudioMonitor extends VisualComponent<ScrollingAudioMonitorDisplay> {
  display: ScrollingAudioMonitorDisplay
  hideZeroSignal: ControlInput<boolean>
  samplePeriodMs: ControlInput<number>
  memorySize: ControlInput<number>
  minValue: ControlInput<number | 'auto'>
  maxValue: ControlInput<number | 'auto'>
  input: AudioRateInput
  audioOutput: AudioRateOutput
  controlOutput: ControlOutput<number[]>

  _memory: number[][] = [] // Channel * time.
  private _analyzers: AnalyserNode[] = []
  private _splitter: ChannelSplitterNode
  private _merger: ChannelMergerNode

  // Display options. TODO: move to display class?
  static defaultHeight = 64;
  static defaultWidth = 256;

  constructor(
    samplePeriodMs?: number,
    memorySize: number = 128,
    minValue: number | 'auto' = 'auto',
    maxValue: number | 'auto' = 'auto',
    hideZeroSignal = true,
    numChannels: number = 6
  ) {
    super()
    samplePeriodMs ??= this.config.defaultSamplePeriodMs
    this.display = new this._.ScrollingAudioMonitorDisplay(this)
    this._splitter = this.audioContext.createChannelSplitter()
    this._merger = this.audioContext.createChannelMerger()

    // Inputs
    this.samplePeriodMs = this.defineControlInput('samplePeriodMs', samplePeriodMs) // TODO: make work again.
    this.memorySize = this.defineControlInput('memorySize', memorySize)
    this.minValue = this.defineControlInput('minValue', minValue)
    this.maxValue = this.defineControlInput('maxValue', maxValue)
    this.hideZeroSignal = this.defineControlInput('hideZeroSignal', hideZeroSignal)
    this.input = this.defineAudioInput('input', this._splitter)
    this.setDefaultInput(this.input)

    // It seems a subgraph including analyzers may be optimized out when the 
    // sink itself is not an analyzer. So add a no-op analyzer sink to keep the
    // signal flowing.
    this._merger.connect(this.audioContext.createAnalyser())

    // Output
    this.audioOutput = this.defineAudioOutput('audioOutput', this._merger)
    this.setDefaultOutput(this.audioOutput)
    this.controlOutput = this.defineControlOutput('controlOutput')

    // Audio routing
    for (let i = 0; i < numChannels; i++) {
      const analyzer = this.audioContext.createAnalyser()
      this._splitter.connect(analyzer, i, 0).connect(this._merger, 0, i)
      this._analyzers.push(analyzer)
      this._memory.push(Array(this.memorySize.value).fill(0.))
    }

    // Define animation loop
    const updateSignalValues = () => {
      const channelValues = []
      for (let i = 0; i < numChannels; i++) {
        // Get i'th channel info.
        const dataArray = new Float32Array(128)
        this._analyzers[i].getFloatTimeDomainData(dataArray)
        const v = dataArray[0]
        this.#addToMemory(this._memory[i], v)
        channelValues.push(v)
      }

      this.display.updateWaveformDisplay()
      this.controlOutput.setValue(channelValues)
      requestAnimationFrame(updateSignalValues)
    }
    updateSignalValues()

    this.preventIOOverwrites()
  }
  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    if (input == this.memorySize) {
      throw new Error("Can't update memorySize yet.")
    } else if (input == this.samplePeriodMs) {
      //this._sampler.samplePeriodMs.setValue(<number>newValue)
    }
  }
  #addToMemory(arr: number[], v: number) {
    arr.push(v)
    if (arr.length > this.memorySize.value) {
      arr.shift()
    }
  }
  getCurrentValueRange(): { minValue: number, maxValue: number } {
    let minValue = this.minValue.value == 'auto' ? Math.min(...this._memory.map(a => Math.min(...a))) : this.minValue.value
    let maxValue = this.maxValue.value == 'auto' ? Math.max(...this._memory.map(a => Math.max(...a))) : this.maxValue.value
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