var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import { StreamSpec } from "./shared/StreamSpec.js";
import { joinContexts } from "./shared/multicontext.js";
import { TimeMeasure } from "./shared/types.js";
import { defineTimeRamp, isFunction, isType, loadFile, zip } from "./shared/util.js";
// @ts-ignore Missing d.ts
import stache from 'stache-config';
import * as internalNamespace from './internals.js';
import publicNamespace from './public.js';
import * as init from './shared/init.js';
const baseWithConfig = stache.registerAndCreateFactoryFn(init.defaultConfig, publicNamespace, Object.assign({}, internalNamespace));
class GestureListener {
    constructor() {
        this.userHasInteracted = false;
        this.gestureListeners = [];
        for (const gesture of GestureListener.USER_GESTURES) {
            document.addEventListener(gesture, () => {
                this.userHasInteracted = true;
                this.gestureListeners.forEach(f => f());
            }, { once: true });
        }
    }
    waitForUserGesture() {
        if (this.userHasInteracted) {
            return Promise.resolve();
        }
        else {
            return new Promise(res => { this.gestureListeners.push(res); });
        }
    }
}
GestureListener.USER_GESTURES = ["change", "click", "contextmenu", "dblclick", "mouseup", "pointerup", "reset", "submit", "touchend"];
const GESTURE_LISTENER = new GestureListener();
export class IATopLevel {
    constructor(config, internals) {
        this.config = config;
        this.internals = internals;
        this.listeners = [];
        this.initStarted = false;
        this.isInitialized = false;
        // TODO: consider not making this an "input".
        this.out = new this.internals.AudioRateInput('out', undefined, config.audioContext.destination);
        this.util = internalNamespace.util;
    }
    get audioContext() {
        return this.config.audioContext;
    }
    createInitListeners() {
        Promise.all([
            this.audioContext.audioWorklet.addModule(this.config.workletPath), GESTURE_LISTENER.waitForUserGesture()
        ]).then(() => {
            this.onSuccessfulInit(true);
        }, () => {
            this.onSuccessfulInit(false);
        });
    }
    onSuccessfulInit(workletAvailable) {
        if (this.isInitialized)
            return;
        this.isInitialized = true;
        this.config.state.workletIsAvailable = workletAvailable;
        workletAvailable || console.warn(`Unable to load worklet file from ${this.config.workletPath}. Worklet-based processing will be disabled. Verify the workletPath configuration setting is set correctly and the file is available.`);
        this.config.audioContext.resume();
        for (const listener of this.listeners) {
            listener(this.config.audioContext);
        }
    }
    /**
     * Register a function to be called once the audio engine is ready and a user gesture has been performed.
     *
     * @param callback A function to run once the audio engine is ready.
     */
    run(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            return callback(this.audioContext);
        });
    }
    init() {
        let resolve;
        let p = new Promise(res => resolve = res);
        if (!this.initStarted)
            this.createInitListeners();
        this.initStarted = true;
        if (this.isInitialized) {
            return Promise.resolve(true);
        }
        else {
            this.listeners.push(() => {
                resolve(true);
            });
        }
        return p;
    }
    withConfig(customConfigOptions = {}, configId) {
        var _a;
        (_a = customConfigOptions.logger) !== null && _a !== void 0 ? _a : (customConfigOptions.logger = new this.internals.SignalLogger());
        customConfigOptions.state = {
            workletIsAvailable: false,
            components: {}
        };
        const config = Object.assign(Object.assign({}, this.config), customConfigOptions);
        const namespace = baseWithConfig(config, configId);
        return new IATopLevel(config, namespace);
    }
    disconnectAll() {
        var _a;
        for (const componentRef of Object.values(this.config.state.components)) {
            (_a = componentRef.deref()) === null || _a === void 0 ? void 0 : _a.disconnect();
        }
        this.config.state.components = {};
    }
    stackChannels(inputs) {
        return this.internals.ChannelStacker.fromInputs(inputs);
    }
    // TODO: implement a method constant(val) that defines a constant signal.
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
    func(fn) {
        return new this.internals.FunctionComponent(fn);
    }
    bufferReader(arg) {
        const bufferComponent = new this.internals.BufferComponent();
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
    createThread() {
        return __awaiter(this, arguments, void 0, function* (_a = {}) {
            var { name, audioContext } = _a, options = __rest(_a, ["name", "audioContext"]);
            const obj = this.withConfig(Object.assign({ audioContext: audioContext !== null && audioContext !== void 0 ? audioContext : new AudioContext() }, options), name);
            let resolve;
            let p = new Promise((res, rej) => {
                resolve = res;
            });
            obj.run(() => { resolve(obj); });
            return p;
        });
    }
}
