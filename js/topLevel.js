import { ChannelStacker } from "./components/ChannelStacker.js";
import { BundleComponent } from "./components/BundleComponent.js";
import { TimeMeasure } from "./shared/types.js";
import { FunctionComponent } from "./components/FunctionComponent.js";
import { AudioTransformComponent } from "./components/AudioTransformComponent.js";
import { defineTimeRamp, isFunction, loadFile } from "./shared/util.js";
import { AudioRateOutput } from "./io/output/AudioRateOutput.js";
import { BaseComponent, BufferComponent, TimeVaryingSignal } from "./internals.js";
import { AudioRecordingComponent } from "./components/AudioRecordingComponent.js";
import { BufferWriterComponent } from "./components/BufferWriterComponent.js";
export function stackChannels(inputs) {
    return ChannelStacker.fromInputs(inputs);
}
export function generate(arg, timeMeasure = TimeMeasure.SECONDS) {
    if (isFunction(arg)) {
        return new TimeVaryingSignal(arg, timeMeasure);
    }
    else {
        throw new Error("not supported yet.");
    }
}
export function combine(inputs, fn, options = {}) {
    if (inputs instanceof Array) {
        return new AudioTransformComponent(fn, options).withInputs(...inputs);
    }
    else {
        // Needs to learn to handle float input I think.
        return new FunctionComponent(fn).withInputs(inputs);
    }
}
// TODO: make this work for inputs/outputs
export function bundle(inputs) {
    return new BundleComponent(inputs);
}
// TODO: Potentially turn this into a component (?).
export function ramp(units) {
    return new AudioRateOutput('time', defineTimeRamp(AudioRateOutput.audioContext, units));
}
export function read(fname) {
    return loadFile(BaseComponent.audioContext, fname);
}
export function bufferReader(arg) {
    const bufferComponent = new BufferComponent();
    const buffer = typeof arg == 'string' ? read(arg) : arg;
    bufferComponent.buffer.setValue(buffer);
    return bufferComponent;
}
export function bufferWriter(buffer) {
    return new BufferWriterComponent(buffer);
}
export function recorder(sources) {
    sources = sources instanceof Array ? sources : [sources];
    const component = new AudioRecordingComponent(sources.length);
    sources.map((s, i) => s.connect(component[i]));
    return component;
}
