import { AudioRateInput } from "../io/input/AudioRateInput.js"
import { AudioRateOutput } from "../io/output/AudioRateOutput.js"
import { BaseComponent } from "./base/BaseComponent.js"

export class ChannelSplitter extends BaseComponent implements Iterable<AudioRateOutput> {
  inputChannelGroups: number[][]
  outputChannels: AudioRateOutput[] = []
  protected splitter: ChannelSplitterNode
  readonly input: AudioRateInput
  length: number
  [idx: number]: AudioRateOutput  // Outputs are numbered.

  constructor(...inputChannelGroups: number[][]) {
    super()
    this.length = inputChannelGroups.length
    this.splitter = this.audioContext.createChannelSplitter()
    this.input = this.defineAudioInput('input', this.splitter)
    this.createMergedOutputs(inputChannelGroups)
  }
  private createMergedOutputs(inputChannelGroups: number[][]) {
    if (inputChannelGroups.length > 32) {
      throw new Error("Can only split into 32 or fewer channels.")
    }
    for (let i = 0; i < inputChannelGroups.length; i++) {
      const mergedNode = this.mergeChannels(inputChannelGroups[i])
      this[i] = this.defineAudioOutput("" + i, mergedNode)
      this.outputChannels.push(this[i])
    }
  }
  private mergeChannels(channels: number[]): ChannelMergerNode {
    const merger = this.audioContext.createChannelMerger(channels.length)
    for (let c = 0; c < channels.length; c++) {
      // The N input channels of the merger will contain the selected output
      // channels of the splitter.
      this.splitter.connect(merger, channels[c], c)
    }
    return merger
  }
  [Symbol.iterator](): Iterator<AudioRateOutput> {
    let index = 0;
    const items = this.outputChannels
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        } else {
          return { value: 0, done: true };
        }
      },
    };
  }
}