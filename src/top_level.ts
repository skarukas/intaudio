import { Component } from "./components/base/Component.js";
import { ChannelStacker } from "./components/ChannelStacker.js";
import { AbstractInput, AudioTransformComponent, FunctionComponent } from "./internals.js";
import { CanBeConnectedTo } from "./shared/types.js";

export function stackChannels(inputs: CanBeConnectedTo[]) {
  return ChannelStacker.fromInputs(inputs)
}

export function generate(arg: any): Component {
  if (arg instanceof Function) {
    return new FunctionComponent(() => Math.random() - 0.5)
  } else {
    throw new Error("not supported yet.")
  }
}

export function combine(inputs: AbstractInput[] | object, fn: Function, options = {}): Component {
  if (inputs instanceof Array) {
    return new AudioTransformComponent(fn, options).withInputs(...inputs)
  } else {
    // Needs to learn to handle float input I think.
    return new FunctionComponent(fn).withInputs(inputs)
  }
}