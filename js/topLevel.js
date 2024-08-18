import { TimeMeasure } from "./shared/types.js";
import { defineTimeRamp, isFunction, isType, loadFile, zip } from "./shared/util.js";
import { BufferComponent } from "./internals.js";
import { StreamSpec } from "./shared/StreamSpec.js";
import { joinContexts } from "./shared/multicontext.js";
export function stackChannels(inputs) {
    return this._.ChannelStacker.fromInputs(inputs);
}
export function generate(fn, timeMeasure = TimeMeasure.SECONDS) {
    if (isFunction(fn)) {
        return new this._.TimeVaryingSignal(fn, timeMeasure);
    }
    else {
        throw new Error("not supported yet.");
    }
}
export function combine(inputs, fn, options = {}) {
    const values = inputs instanceof Array ? inputs : Object.values(inputs);
    // TODO: Also allow cases where the arguments aren't outputs, but values 
    // themselves.
    if (values.every(o => o.isControlStream)) {
        // Needs to learn to handle float input I think.
        return new this._.FunctionComponent(fn).withInputs(inputs);
    }
    else {
        return new this._.AudioTransformComponent(fn, Object.assign(Object.assign({}, options), { inputSpec: new StreamSpec({ numStreams: values.length }) })).withInputs(...values);
    }
}
// TODO: make this work for inputs/outputs
export function bundle(inputs) {
    return new this._.BundleComponent(inputs);
}
// TODO: Potentially turn this into a component (?).
export function ramp(units) {
    return new this._.AudioRateOutput('time', defineTimeRamp(this.config.audioContext, units));
}
export function read(fname) {
    return loadFile(this.config.audioContext, fname);
}
export function bufferReader(arg) {
    const bufferComponent = new BufferComponent();
    const buffer = isType(arg, String) ? read.call(this, arg) : arg;
    bufferComponent.buffer.setValue(buffer);
    return bufferComponent;
}
export function bufferWriter(buffer) {
    return new this._.BufferWriterComponent(buffer);
}
export function recorder(sources) {
    sources = sources instanceof Array ? sources : [sources];
    const component = new this._.AudioRecordingComponent(sources.length);
    sources.map((s, i) => s.connect(component.inputs[i]));
    return component;
}
/**
 * Allow joining ("mixing") across multiple audioContexts / threads.
 */
export function join(sources) {
    const sourceContexts = [...new Set(sources.map(s => s.audioContext))];
    const { sinks, source } = joinContexts(sourceContexts, this.config.audioContext);
    const sinkMap = new Map(zip(sourceContexts, sinks));
    for (const sourceConnectable of sources) {
        const sink = sinkMap.get(sourceConnectable.audioContext);
        if (sink == undefined) {
            throw new Error(`Unable to find audioContext of ${sourceConnectable}.`);
        }
        sourceConnectable.connect(sink);
    }
    return new this._.AudioComponent(source);
}
