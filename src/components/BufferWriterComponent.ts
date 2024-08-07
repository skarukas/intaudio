import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { bufferToFloat32Arrays, getBufferId, makeBufferShared } from "../shared/util.js";
import { BUFFER_WRITER_WORKLET_NAME } from "../worklet/BufferWriterWorklet.js";
import { BaseComponent } from "./base/BaseComponent.js";

export class BufferWriterComponent extends BaseComponent {
  readonly position: AudioRateInput
  readonly valueToWrite: AudioRateInput
  readonly buffer: ControlInput<AudioBuffer>

  protected worklet: AudioWorkletNode

  constructor(buffer?: AudioBuffer) {
    super()
    const numChannels = buffer?.numberOfChannels ?? 2
    this.worklet = new AudioWorkletNode(
      this.audioContext,
      BUFFER_WRITER_WORKLET_NAME,
      {
        numberOfInputs: 2,
        numberOfOutputs: 0
      })
    this.worklet['__numInputChannels'] = numChannels
    this.worklet['__numOutputChannels'] = numChannels
    this.worklet.port.onmessage = event => {
      this.handleMessage(event.data)
    }

    const positionGain = this.audioContext.createGain()
    const valueGain = this.audioContext.createGain()
    positionGain.connect(this.worklet, undefined, 0)
    valueGain.connect(this.worklet, undefined, 1)

    // Input
    this.position = this.defineAudioInput('position', positionGain)
    this.valueToWrite = this.defineAudioInput('valueToWrite', valueGain)
    this.buffer = this.defineControlInput('buffer', buffer, true).ofType(AudioBuffer)
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
  // Update buffer in-place. This will be called periodically from the worklet 
  // thread.
  protected handleMessage(floatData: Float32Array[]) {
    const buffer = this.buffer.value
    floatData.map((channel, i) => buffer.copyToChannel(channel, i))
  }
}