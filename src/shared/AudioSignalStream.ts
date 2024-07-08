import { Component } from "../components/base/Component.js";
import { Connectable } from "./base/Connectable.js";

export interface AudioSignalStream extends Connectable {
  get numInputChannels(): number;
  get numOutputChannels(): number;

  sampleSignal(samplePeriodMs?: number): Component;
  splitChannels(): Iterable<AudioSignalStream>;
  splitChannels(...inputChannelGroups: number[][]): Iterable<AudioSignalStream>;

  // Lots of overloads.
  transformAudio(fn: (left: Float32Array, right?: Float32Array, ...channels: Float32Array[]) => (number[] | Float32Array)[], dimension: "all", windowSize?: number): Component;
  transformAudio(fn: (left: number, right?: number, ...channels: number[]) => number[], dimension: "channels"): Component;
  transformAudio(fn: (samples: Float32Array) => (Float32Array | number[]), dimension: "time", windowSize?: number): Component;
  transformAudio(fn: (x: number) => number, dimension?: "none"): Component;
}