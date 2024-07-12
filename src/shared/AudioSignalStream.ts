import { Component } from "../components/base/Component.js";
import { Connectable } from "./base/Connectable.js";
import { MultiChannelArray } from "./multichannel.js";

export interface AudioSignalStream extends Connectable {
  get numInputChannels(): number;
  get numOutputChannels(): number;

  sampleSignal(samplePeriodMs?: number): Component;
  splitChannels(): Iterable<AudioSignalStream>;
  splitChannels(...inputChannelGroups: number[][]): Iterable<AudioSignalStream>;

  // Lots of overloads.
  transformAudio(fn: (input: MultiChannelArray<Float32Array>) => (number[] | Float32Array)[], dimension: "all", { windowSize, useWorklet}?: { windowSize?: number, useWorklet?: boolean }): Component;
  transformAudio(fn: (input: MultiChannelArray<number>) => number[], dimension: "channels", { useWorklet }?: { useWorklet?: boolean }): Component;
  transformAudio(fn: (samples: Float32Array) => (Float32Array | number[]), dimension: "time", { windowSize, useWorklet}?: { windowSize?: number, useWorklet?: boolean }): Component;
  transformAudio(fn: (x: number) => number, dimension?: "none", { useWorklet }?: { useWorklet?: boolean }): Component;
}