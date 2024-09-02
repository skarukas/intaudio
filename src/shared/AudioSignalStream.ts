import { Component } from "../components/base/Component.js";
import { MultiChannelArray } from "../worklet/lib/types.js";
import { Connectable } from "./base/Connectable.js";
import { FFTStream } from "./FFTStream.js";

export interface AudioSignalStream extends Connectable {
  get numInputChannels(): number;
  get numOutputChannels(): number;

  sampleSignal(samplePeriodMs?: number): Component;
  logSignal({ samplePeriodMs, format }: { samplePeriodMs?: number, format: string }): this;
  splitChannels(): Iterable<AudioSignalStream>;
  splitChannels(...inputChannelGroups: number[][]): Iterable<AudioSignalStream>;
  toChannels(
    numChannels: number,
    mode?: 'speakers' | 'discrete' | 'repeat'
  ): Component;

  // Lots of overloads.
  transformAudio(
    fn: (input: MultiChannelArray<Float32Array>) => (number[] | Float32Array)[],
    {
      windowSize,
      useWorklet,
      dimension
    }: {
      windowSize?: number,
      useWorklet?: boolean,
      dimension: "all"
    }
  ): Component;
  transformAudio(
    fn: (input: MultiChannelArray<number>) => number[],
    {
      useWorklet,
      dimension
    }: {
      useWorklet?: boolean,
      dimension: "channels"
    }
  ): Component;
  transformAudio(
    fn: (samples: Float32Array) => (Float32Array | number[]),
    {
      windowSize,
      useWorklet,
      dimension
    }: {
      windowSize?: number,
      useWorklet?: boolean,
      dimension: "time"
    }
  ): Component;
  transformAudio(
    fn: (x: number) => number,
    {
      useWorklet,
      dimension
    }: {
      useWorklet?: boolean,
      dimension?: "none"
    }
  ): Component;

  capture(numSamples: number): Promise<AudioBuffer[]>;
  fft(fftSize?: number): FFTStream // TODO: allow options to be passed.
}