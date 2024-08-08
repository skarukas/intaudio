import { Component } from "./components/base/Component.js";
import { ChannelStacker } from "./components/ChannelStacker.js";
import { BundleComponent } from "./components/BundleComponent.js";
import { MaybePromise, ObjectOrArrayOf, TimeMeasure } from "./shared/types.js";
import { Connectable } from "./shared/base/Connectable.js";
import { FunctionComponent } from "./components/FunctionComponent.js";
import { AbstractInput } from "./io/input/AbstractInput.js";
import { AudioTransformComponent } from "./components/AudioTransformComponent.js";
import { defineTimeRamp, isFunction, loadFile } from "./shared/util.js";
import { AudioRateOutput } from "./io/output/AudioRateOutput.js";
import { BaseComponent, BufferComponent, TimeVaryingSignal } from "./internals.js";
import { AudioRecordingComponent } from "./components/AudioRecordingComponent.js";
import { BufferWriterComponent } from "./components/BufferWriterComponent.js";

export function stackChannels(inputs: Connectable[]) {
  return ChannelStacker.fromInputs(inputs)
}

export function generate(arg: any, timeMeasure: TimeMeasure = TimeMeasure.SECONDS): Component {
  if (isFunction(arg)) {
    return new TimeVaryingSignal(arg, timeMeasure)
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
export function bundle(inputs: ObjectOrArrayOf<Component>) {
  return new BundleComponent(inputs)
}

// TODO: Potentially turn this into a component (?).
export function ramp(units: TimeMeasure): Connectable {
  return new AudioRateOutput('time', defineTimeRamp(AudioRateOutput.audioContext, units))
}

export function read(fname: string): Promise<AudioBuffer> {
  return loadFile(BaseComponent.audioContext, fname)
}

export function bufferReader(fname: string): BufferComponent
export function bufferReader(buffer: MaybePromise<AudioBuffer>): BufferComponent
export function bufferReader(
  arg: string | MaybePromise<AudioBuffer>
): BufferComponent {
  const bufferComponent = new BufferComponent()
  const buffer = typeof arg == 'string' ? read(arg) : arg
  bufferComponent.buffer.setValue(buffer)
  return bufferComponent
}

export function bufferWriter(buffer: AudioBuffer) {
  return new BufferWriterComponent(buffer)
}

// TODO: handle more input types.
export function recorder(sources: Connectable[]);
export function recorder(sourceAudio: Connectable);
export function recorder(sources: any) {
  sources = sources instanceof Array ? sources : [sources]
  const component = new AudioRecordingComponent(sources.length)
  sources.map((s, i) => s.connect(component[i]))
  return component
}