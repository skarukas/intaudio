import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { bufferToFloat32Arrays, getBufferId } from "../shared/util.js";
import { BUFFER_WORKLET_NAME } from "../worklet/BufferWorklet.js";
import { BaseComponent } from "./base/BaseComponent.js";

type I = {
  time: AudioRateInput,
  buffer: ControlInput<AudioBuffer>
}

type O = {
  output: AudioRateOutput
}

export class BufferComponent extends BaseComponent<I, O> {
  readonly time: AudioRateInput
  readonly buffer: ControlInput<AudioBuffer>
  readonly output: AudioRateOutput

  protected worklet: AudioWorkletNode

  constructor(buffer?: AudioBuffer) {
    super()
    const numChannels = buffer?.numberOfChannels ?? 2
    this.worklet = new AudioWorkletNode(this.audioContext, BUFFER_WORKLET_NAME, {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [numChannels],
      processorOptions: {
        buffer: buffer ? bufferToFloat32Arrays(buffer) : undefined,
        bufferId: buffer ? getBufferId(buffer) : undefined
      }
    })
    // @ts-ignore Property undefined.
    this.worklet['__numInputChannels'] = numChannels
    // @ts-ignore Property undefined.
    this.worklet['__numOutputChannels'] = numChannels

    // Input
    this.buffer = this.defineControlInput('buffer', buffer, true).ofType(AudioBuffer)
    this.time = this.defineAudioInput('time', this.worklet).ofType(Number)

    // Output
    this.output = this.defineAudioOutput('output', this.worklet).ofType(Number)
    buffer && this.setBuffer(buffer)
  }
  get bufferId(): string {
    return getBufferId(this.buffer.value)
  }
  setBuffer(buffer: AudioBuffer) {
    this.worklet.port.postMessage({
      buffer: bufferToFloat32Arrays(buffer),
      bufferId: this.bufferId
    })
  }
  protected inputDidUpdate(input: any, newValue: any): void {
    if (input == this.buffer) {
      if ((<AudioBuffer>newValue).numberOfChannels != this.buffer.value.numberOfChannels) {
        // TODO: better error message.
        throw new Error("Wrong number of channels")
      }
      this.setBuffer(newValue)
    }
  }
}