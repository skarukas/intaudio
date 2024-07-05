import { Component } from "../components/base/Component.js";
import { Connectable } from "./base/Connectable.js";

export interface AudioSignalStream extends Connectable {
  sampleSignal(samplePeriodMs?: number): Component;
  splitChannels(): Iterable<AudioSignalStream>;
  splitChannels(...inputChannelGroups: number[][]): Iterable<AudioSignalStream>;
}