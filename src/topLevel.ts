import { Component } from "./components/base/Component.js";
import { ChannelStacker } from "./components/ChannelStacker.js";
import { BundleComponent } from "./components/BundleComponent.js";
import { MaybePromise, ObjectOf, ObjectOrArrayOf, TimeMeasure } from "./shared/types.js";
import { Connectable } from "./shared/base/Connectable.js";
import { FunctionComponent } from "./components/FunctionComponent.js";
import { AbstractInput } from "./io/input/AbstractInput.js";
import { AudioTransformComponent } from "./components/AudioTransformComponent.js";
import { defineTimeRamp, isFunction, isType, loadFile } from "./shared/util.js";
import { AudioRateOutput } from "./io/output/AudioRateOutput.js";
import { AbstractOutput, BaseComponent, BufferComponent, TimeVaryingSignal, TypedConfigurable } from "./internals.js";
import { AudioRecordingComponent } from "./components/AudioRecordingComponent.js";
import { BufferWriterComponent } from "./components/BufferWriterComponent.js";
import { StreamSpec } from "./shared/StreamSpec.js";

export function stackChannels(
  this: TypedConfigurable,
  inputs: Connectable[]
) {
  return this._.ChannelStacker.fromInputs(inputs)
}

export function generate(
  this: TypedConfigurable,
  fn: (t: number) => number,
  timeMeasure: TimeMeasure = TimeMeasure.SECONDS
): Component {
  if (isFunction(fn)) {
    return new this._.TimeVaryingSignal(fn, timeMeasure)
  } else {
    throw new Error("not supported yet.")
  }
}

export function combine(
  this: TypedConfigurable,
  inputs: AbstractOutput[] | ObjectOf<AbstractOutput>,
  fn: Function, options = {}
): Component {
  const values: AbstractOutput[] = inputs instanceof Array ? inputs : Object.values(inputs)
  // TODO: Also allow cases where the arguments aren't outputs, but values 
  // themselves.
  if (values.every(o => o.isControlStream)) {
    // Needs to learn to handle float input I think.
    return new this._.FunctionComponent(fn).withInputs(inputs)
  } else {
    return new this._.AudioTransformComponent(
      fn,
      { ...options, inputSpec: new StreamSpec({ numStreams: values.length }) }
    ).withInputs(...values)
  }
}

// TODO: make this work for inputs/outputs
export function bundle(
  this: TypedConfigurable,
  inputs: ObjectOrArrayOf<Component>
) {
  return new this._.BundleComponent(inputs)
}

// TODO: Potentially turn this into a component (?).
export function ramp(
  this: TypedConfigurable,
  units: TimeMeasure
): Connectable {
  return new this._.AudioRateOutput('time', defineTimeRamp(this.config.audioContext, units))
}

export function read(
  this: TypedConfigurable,
  fname: string
): Promise<AudioBuffer> {
  return loadFile(this.config.audioContext, fname)
}

export function bufferReader(this: TypedConfigurable, fname: string): BufferComponent
export function bufferReader(this: TypedConfigurable, buffer: MaybePromise<AudioBuffer>): BufferComponent
export function bufferReader(
  this: TypedConfigurable,
  arg: string | MaybePromise<AudioBuffer>
): BufferComponent {
  const bufferComponent = new BufferComponent()
  const buffer = isType(arg, String) ? read.call(this, arg) : arg
  bufferComponent.buffer.setValue(buffer)
  return bufferComponent
}

export function bufferWriter(this: TypedConfigurable, buffer: AudioBuffer): BufferWriterComponent {
  return new this._.BufferWriterComponent(buffer)
}

// TODO: handle more input types.
export function recorder(this: TypedConfigurable, sources: Connectable[]): AudioRecordingComponent
export function recorder(this: TypedConfigurable, sourceAudio: Connectable): AudioRecordingComponent
export function recorder(this: TypedConfigurable, sources: any): AudioRecordingComponent {
  sources = sources instanceof Array ? sources : [sources]
  const component = new this._.AudioRecordingComponent(sources.length)
  sources.map((s: Component, i: number) => s.connect(component.inputs[i]))
  return component
}