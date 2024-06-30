import { BaseComponent } from "../components/base/BaseComponent.js"
import { AbstractInput } from "../io/input/AbstractInput.js"

export type CanBeConnectedTo = (
  BaseComponent | WebAudioConnectable | AudioNode | Function | AbstractInput
)

// Any type where AudioNode.connect can connect to it.
export type WebAudioConnectable = AudioParam | AudioNode

export enum WaveType {
  SINE = "sine",
  SQUARE = "square",
  SAWTOOTH = "sawtooth",
  TRIANGLE = "triangle",
  CUSTOM = "custom"
  // TODO: add more
}

export enum RangeType {
  SLIDER = 'slider',
  KNOB = 'knob'
}