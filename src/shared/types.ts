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

export enum TimeMeasure {
  CYCLES = 'cycles',
  SECONDS = 'seconds',
  SAMPLES = 'samples'
}

export type AnyFn<T0, T1, T2, T3, T4, T5, ReturnType> = Function
  | (() => ReturnType)
  | ((a0?: T0) => ReturnType)
  | ((a0?: T0, a1?: T1) => ReturnType)
  | ((a0?: T0, a1?: T1, a2?: T2) => ReturnType)
  | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3) => ReturnType)
  | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4) => ReturnType)
  | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5) => ReturnType)
  | ((a0?: T0, a1?: T1, a2?: T2, a3?: T3, a4?: T4, a5?: T5, ...args: any[]) => ReturnType);