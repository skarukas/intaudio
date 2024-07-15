import { Component } from "./components/base/Component.js";
import { ChannelStacker } from "./components/ChannelStacker.js";
import { GroupComponent } from "./components/GroupComponent.js";
import { AbstractInput, AudioTransformComponent, FunctionComponent } from "./internals.js";
import { CanBeConnectedTo, ObjectOrArrayOf } from "./shared/types.js";

export function stackChannels(inputs: CanBeConnectedTo[]) {
  return ChannelStacker.fromInputs(inputs)
}

export function generate(arg: any): Component {
  if (arg instanceof Function) {
    return new FunctionComponent(arg)
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

// TODO: make this work for inputs/outputs
export function group(inputs: ObjectOrArrayOf<Component>) {
  return new GroupComponent(inputs)
}

export function split(spec: string[][]);
export function split(functions: ObjectOrArrayOf<((Component) => Component)>);
export function split(arg: any) {

}