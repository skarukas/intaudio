var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { TimeMeasure } from "./shared/types.js";
import { defineTimeRamp, isFunction, isType, loadFile, zip } from "./shared/util.js";
import { StreamSpec } from "./shared/StreamSpec.js";
import { joinContexts } from "./shared/multicontext.js";
import { BufferComponent } from "./components/BufferComponent.js";
// @ts-ignore Missing d.ts
import stache from 'stache-config';
import * as internalNamespace from './internals.js';
import publicNamespace from './public.js';
import * as init from './shared/init.js';
const baseWithConfig = stache.registerAndCreateFactoryFn(init.defaultConfig, publicNamespace, Object.assign({}, internalNamespace));
const USER_GESTURES = ["change", "click", "contextmenu", "dblclick", "mouseup", "pointerup", "reset", "submit", "touchend"];
export class IATopLevel {
    constructor(config, internals) {
        this.config = config;
        this.internals = internals;
        this.gestureListeners = [];
        this.runCalled = false;
        this.out = new this.internals.AudioRateInput('out', undefined, config.audioContext.destination);
        this.util = internalNamespace.util;
    }
    get audioContext() {
        return this.config.audioContext;
    }
    createInitListeners() {
        const workletPromise = this.audioContext.audioWorklet.addModule(this.config.workletPath);
        const initAfterAsync = () => {
            workletPromise.then(() => this.init(true), () => this.init(false));
        };
        for (const gesture of USER_GESTURES) {
            document.addEventListener(gesture, initAfterAsync, { once: true });
        }
    }
    init(workletAvailable) {
        if (this.config.state.isInitialized)
            return;
        this.config.state.isInitialized = true;
        this.config.state.workletIsAvailable = workletAvailable;
        workletAvailable || console.warn(`Unable to load worklet file from ${this.config.workletPath}. Worklet-based processing will be disabled. Verify the workletPath configuration setting is set correctly and the file is available.`);
        this.config.audioContext.resume();
        for (const listener of this.gestureListeners) {
            listener(this.config.audioContext);
        }
    }
    /**
     * Register a function to be called once the audio engine is ready and a user gesture has been performed.
     *
     * @param callback A function to run once the audio engine is ready.
     */
    run(callback) {
        if (!this.runCalled)
            this.createInitListeners();
        this.runCalled = true;
        if (this.config.state.isInitialized) {
            callback(this.config.audioContext);
        }
        else {
            this.gestureListeners.push(callback);
        }
    }
    withConfig(customConfigOptions = {}, configId) {
        const config = Object.assign(Object.assign({}, this.config), customConfigOptions);
        const namespace = baseWithConfig(config, configId);
        const topLevel = new IATopLevel(config, namespace);
        return new IATopLevel(config, namespace);
    }
    stackChannels(inputs) {
        return this.internals.ChannelStacker.fromInputs(inputs);
    }
    generate(fn, timeMeasure = TimeMeasure.SECONDS) {
        if (isFunction(fn)) {
            return new this.internals.TimeVaryingSignal(fn, timeMeasure);
        }
        else {
            throw new Error("not supported yet.");
        }
    }
    combine(inputs, fn, options = {}) {
        const values = inputs instanceof Array ? inputs : Object.values(inputs);
        // TODO: Also allow cases where the arguments aren't outputs, but values 
        // themselves.
        if (values.every(o => o.isControlStream)) {
            // Needs to learn to handle float input I think.
            return new this.internals.FunctionComponent(fn).withInputs(inputs);
        }
        else {
            return new this.internals.AudioTransformComponent(fn, Object.assign(Object.assign({}, options), { inputSpec: new StreamSpec({ numStreams: values.length }) })).withInputs(...values);
        }
    }
    // TODO: make this work for inputs/outputs
    bundle(inputs) {
        return new this.internals.BundleComponent(inputs);
    }
    // TODO: Potentially turn this into a component (?).
    ramp(units) {
        return new this.internals.AudioRateOutput('time', defineTimeRamp(this.config.audioContext, units));
    }
    read(fname) {
        return loadFile(this.config.audioContext, fname);
    }
    bufferReader(arg) {
        const bufferComponent = new BufferComponent();
        const buffer = isType(arg, String) ? this.read(arg) : arg;
        bufferComponent.buffer.setValue(buffer);
        return bufferComponent;
    }
    bufferWriter(buffer) {
        return new this.internals.BufferWriterComponent(buffer);
    }
    recorder(sources) {
        sources = sources instanceof Array ? sources : [sources];
        const component = new this.internals.AudioRecordingComponent(sources.length);
        sources.map((s, i) => s.connect(component.inputs[i]));
        return component;
    }
    /**
     * Allow joining ("mixing") across multiple audioContexts / threads.
     */
    join(sources) {
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
        return new this.internals.AudioComponent(source);
    }
    createThread(_a = {}) {
        var { name, audioContext } = _a, options = __rest(_a, ["name", "audioContext"]);
        return this.withConfig(Object.assign({ audioContext: audioContext !== null && audioContext !== void 0 ? audioContext : new AudioContext() }, options), name);
    }
}
