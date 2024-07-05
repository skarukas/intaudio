import { AudioRateInput } from "../io/input/AudioRateInput.js"
import { HybridInput } from "../io/input/HybridInput.js"
import { AudioRateOutput } from "../io/output/AudioRateOutput.js"
import { numChannels } from "../shared/multichannel.js"
import { CanBeConnectedTo } from "../shared/types.js"
import { BaseComponent } from "./base/BaseComponent.js"

const PRIVATE_CONSTRUCTOR = Symbol("PRIVATE_CONSTRUCTOR")
export class ChannelStacker extends BaseComponent {
  readonly stackedInputs: AudioRateInput[] = []
  readonly output: AudioRateOutput
  [idx: number]: AudioRateInput

  private constructor(
    numChannelsPerInput: number[],
    __privateConstructorCall: Symbol = undefined
  ) {
    super()
    if (__privateConstructorCall !== PRIVATE_CONSTRUCTOR) {
      throw new Error("ChannelStacker cannot be constructed directly. Use ChannelStacker.fromInputs instead.")
    }
    const numOutputChannels = numChannelsPerInput.reduce((a, b) => a + b)
    const merger = this.audioContext.createChannelMerger(numOutputChannels)
    let outChannel = 0
    for (let i = 0; i < numChannelsPerInput.length; i++) {
      const splitter = this.audioContext.createChannelSplitter()
      // Route inputs to outputs
      for (let inChannel = 0; inChannel < numChannelsPerInput[i]; inChannel++) {
        splitter.connect(merger, inChannel, outChannel)
        outChannel++;
      }
      const input = this.defineAudioInput("" + i, splitter)
      this.stackedInputs.push(input)
      this[i] = input
    }

    this.output = this.defineAudioOutput('output', merger)
  }
  static fromInputs(destinations: CanBeConnectedTo[]): ChannelStacker {
    const inputs = []
    const numChannelsPerInput = []
    const inputObj = {}
    for (let i = 0; i < destinations.length; i++) {
      const { input } = this.prototype.getDestinationInfo(destinations[i])
      if (!(input instanceof HybridInput || input instanceof AudioRateInput)) {
        throw new Error(`A ChannelStacker can only be created from audio-rate inputs. Given ${destinations[i]}, which is not an audio-rate input nor a component with a default audio-rate input.`)
      }
      inputs.push(input)
      numChannelsPerInput.push(numChannels(input.audioSink))
      inputObj[i] = destinations[i]
    }
    const stacker = new this._.ChannelStacker(numChannelsPerInput, PRIVATE_CONSTRUCTOR)
    return stacker.withInputs(inputObj)
  }
}

export function stackChannels(inputs: CanBeConnectedTo[]) {
  return ChannelStacker.fromInputs(inputs)
}