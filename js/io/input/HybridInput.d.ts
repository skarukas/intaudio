import { Component } from "../../components/base/Component.js";
import { MultiChannel, WebAudioConnectable } from "../../shared/types.js";
import { MultiChannelArray } from "../../worklet/lib/types.js";
import { AbstractInput } from "./AbstractInput.js";
export declare class HybridInput<T> extends AbstractInput<T> implements MultiChannel<HybridInput<T>> {
  name: string | number;
  parent: Component;
  audioSink: WebAudioConnectable;
  isRequired: boolean;
  get numInputChannels(): number;
  readonly channels: MultiChannelArray<this>;
  activeChannel: number | undefined;
  private _value;
  constructor(name: string | number, parent: Component, audioSink: WebAudioConnectable, defaultValue?: T | undefined, isRequired?: boolean);
  get left(): this;
  get right(): this;
  get value(): T | undefined;
  setValue(value: T | Promise<T>): void;
}
