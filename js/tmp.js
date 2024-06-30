var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BaseEvent_defaultIgnored, _HandlerMixin_instances, _HandlerMixin_getHandlers, _BaseComponent_instances, _BaseComponent_freezeProperty, _BaseComponent_defineInputOrOutput, _BaseComponent_allInputsAreDefined, _VisualComponent_instances, _VisualComponent_addBypassIndicator, _VisualComponent_assertDisplayIsUsable, _AudioRateSignalSampler_instances, _AudioRateSignalSampler_interval, _AudioRateSignalSampler_getCurrentSignalValue, _AudioRateSignalSampler_setInterval, _ScrollingAudioMonitorDisplay_instances, _ScrollingAudioMonitorDisplay_valueToDisplayableText, _ScrollingAudioMonitorDisplay_displayWaveform, _ScrollingAudioMonitor_instances, _ScrollingAudioMonitor_addToMemory, _FunctionComponent_instances, _FunctionComponent_parallelApplyAcrossChannels, _AudioParamControlOutput_instances, _AudioParamControlOutput_map, _SliderDisplay_instances, _SliderDisplay_getInputAttrs, _Keyboard_instances, _Keyboard_getKeyId, _TypingKeyboardMIDI_instances, _a, _TypingKeyboardMIDI_registerKeyHandlers, _TypingKeyboardMIDI_getPitchFromKey, _SimplePolyphonicSynth_instances, _SimplePolyphonicSynth_createOscillatorGraph;
import $ from 'jquery';
import stache from 'stache-config';
import constants from "./shared/constants.js";
// TODO: transform constructors and some functions to take in objects instead 
// of a list of parameters (can't specify named parameters)
export class TypedConfigurable extends stache.Configurable {
}
export class AudioConfig {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }
}
export class ToStringAndUUID extends TypedConfigurable {
    constructor() {
        super();
        this._uuid = crypto.randomUUID();
    }
    get _className() {
        return this.constructor.name;
    }
    toString() {
        return this._className;
    }
    get audioContext() {
        return this.config.audioContext;
    }
    static get audioContext() {
        return this.config.audioContext;
    }
}
export class Connectable extends ToStringAndUUID {
    getDestinationInfo(destination) {
        if (destination instanceof Function) {
            destination = new this._.FunctionComponent(destination);
        }
        let component, input;
        if ((destination instanceof AudioNode)
            || (destination instanceof AudioParam)) {
            component = new this._.AudioComponent(destination);
            input = component.getDefaultInput();
        }
        else if (destination instanceof AbstractInput) {
            component = destination.parent;
            input = destination;
        }
        else if (destination instanceof BaseComponent) {
            component = destination;
            input = destination.getDefaultInput();
        }
        else {
            throw new Error("Improper input type for connect(). " + destination);
        }
        if (destination instanceof TypedConfigurable && destination.configId != this.configId) {
            throw new Error(`Unable to connect components from different namespaces. Given ${this} (config ID: ${this.configId}) and ${destination} (config ID: ${destination.configId})`);
        }
        return { component, input };
    }
}
const TRIGGER = Symbol('trigger');
export class BaseEvent extends ToStringAndUUID {
    constructor() {
        super(...arguments);
        this._isLocal = false;
        _BaseEvent_defaultIgnored.set(this, false);
    }
    ignoreDefault() {
        __classPrivateFieldSet(this, _BaseEvent_defaultIgnored, true, "f");
    }
    defaultIsIgnored() {
        return __classPrivateFieldGet(this, _BaseEvent_defaultIgnored, "f");
    }
}
_BaseEvent_defaultIgnored = new WeakMap();
export class BypassEvent extends BaseEvent {
    constructor(shouldBypass) {
        super();
        this.shouldBypass = shouldBypass;
        this._isLocal = true;
    }
}
export class MuteEvent extends BaseEvent {
    constructor(shouldMute) {
        super();
        this.shouldMute = shouldMute;
        this._isLocal = true;
    }
}
var KeyEventType;
(function (KeyEventType) {
    KeyEventType["KEY_DOWN"] = "keydown";
    KeyEventType["KEY_UP"] = "keyup";
})(KeyEventType || (KeyEventType = {}));
export class KeyEvent extends BaseEvent {
    constructor(eventType, eventPitch = 64, eventVelocity = 64, key) {
        super();
        this.eventType = eventType;
        this.eventPitch = eventPitch;
        this.eventVelocity = eventVelocity;
        this.key = key !== null && key !== void 0 ? key : eventPitch;
    }
}
export class HandlerMixin extends Connectable {
    constructor() {
        super(...arguments);
        _HandlerMixin_instances.add(this);
    }
    onMuteEvent(event) { }
    onAnyEvent(event) { }
    onBypassEvent(event) { }
    onKeyEvent(event) { }
    _handleEvent(event) {
        for (let handler of __classPrivateFieldGet(this, _HandlerMixin_instances, "m", _HandlerMixin_getHandlers).call(this)) {
            if (event instanceof handler.class) {
                handler.callback.bind(this)(event);
            }
        }
    }
}
_HandlerMixin_instances = new WeakSet(), _HandlerMixin_getHandlers = function _HandlerMixin_getHandlers() {
    return [
        { class: BaseEvent, callback: this.onAnyEvent },
        { class: MuteEvent, callback: this.onMuteEvent },
        { class: BypassEvent, callback: this.onBypassEvent },
        { class: KeyEvent, callback: this.onKeyEvent },
    ];
};
export class AbstractOutput extends Connectable {
    constructor() {
        super(...arguments);
        this.connections = [];
        this.callbacks = [];
    }
}
export class ControlOutput extends AbstractOutput {
    connect(destination) {
        let { component } = this.getDestinationInfo(destination);
        this.connections.push(destination);
        return component;
    }
    setValue(value) {
        for (let c of this.connections) {
            c.setValue(value);
        }
        for (const callback of this.callbacks) {
            callback(value);
        }
    }
    onUpdate(callback) {
        this.callbacks.push(callback);
    }
}
function createConstantSource(audioContext) {
    let src = audioContext.createConstantSource();
    src.offset.setValueAtTime(0, audioContext.currentTime);
    src.start();
    return src;
}
// TODO: Add a GainNode here to allow muting and mastergain of the component.
export class AudioRateOutput extends AbstractOutput {
    constructor(audioNode) {
        super();
        this.audioNode = audioNode;
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (!(input instanceof AudioRateInput || input instanceof HybridInput)) {
            throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use ${AudioRateSignalSampler.name} to force a conversion.`);
        }
        input.audioSink && this.audioNode.connect(input.audioSink);
        this.connections.push(input);
        component === null || component === void 0 ? void 0 : component.wasConnectedTo(this);
        return component;
    }
    sampleSignal(samplePeriodMs = _GLOBAL_STATE.defaultSamplePeriodMs) {
        return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs));
    }
}
export class AbstractInput extends ToStringAndUUID {
    constructor(parent, isRequired) {
        super();
        this.parent = parent;
        this.isRequired = isRequired;
    }
    trigger() {
        this.setValue(TRIGGER);
    }
}
// Special placeholder for when an input both has no defaultValue and it has 
// never been set. Not using undefined or null because these can potentially be 
// set as "legitimate" args by the caller.
// TODO: need special value?
const _UNSET_VALUE = undefined; // Symbol("UNSET")
export class ControlInput extends AbstractInput {
    constructor(parent, defaultValue = _UNSET_VALUE, isRequired = false) {
        super(parent, isRequired);
        this._value = defaultValue;
    }
    get value() {
        return this._value;
    }
    setValue(value) {
        var _b;
        if (value == TRIGGER && this.value != undefined) {
            value = this.value;
        }
        this._value = value;
        (_b = this.parent) === null || _b === void 0 ? void 0 : _b.propagateUpdatedInput(this, value);
    }
}
export class AudioRateInput extends AbstractInput {
    constructor(parent, audioSink) {
        super(parent, false);
        this.parent = parent;
        this.audioSink = audioSink;
    }
    get value() {
        return this.audioSink["value"];
    }
    setValue(value) {
        if (value == TRIGGER) {
            value = this.value;
        }
        this.audioSink["value"] = value;
    }
}
export class HybridInput extends AbstractInput {
    // Hybrid input can connect an audio input to a sink, but it also can
    // receive control inputs.
    constructor(parent, audioSink, defaultValue = _UNSET_VALUE, isRequired = false) {
        super(parent, isRequired);
        this.parent = parent;
        this.audioSink = audioSink;
        this.isRequired = isRequired;
        this._value = defaultValue;
    }
    get value() {
        return this._value;
    }
    setValue(value) {
        var _b;
        if (value == TRIGGER && this.value != undefined) {
            value = this.value;
        }
        this._value = value;
        this.audioSink["value"] = value;
        (_b = this.parent) === null || _b === void 0 ? void 0 : _b.propagateUpdatedInput(this, value);
    }
}
// A special wrapper for a symbolic input that maps object signals to property assignments.
// let i = new ComponentInput(parent)
// i.setValue({ input1: "val1", input2: "val2" })  // sets vals on parent.
export class ComponentInput extends AudioRateInput {
    constructor(parent, defaultInput) {
        const audioNode = (defaultInput instanceof AudioRateInput) ? defaultInput.audioSink : undefined;
        super(parent, audioNode);
        this.defaultInput = defaultInput;
        this.defaultInput = defaultInput;
        this._value = defaultInput === null || defaultInput === void 0 ? void 0 : defaultInput.value;
    }
    setValue(value) {
        // JS objects represent collections of parameter names and values
        const isPlainObject = value.constructor === Object;
        if (isPlainObject && !value._raw) {
            // Validate each param is defined in the target.
            for (let key in value) {
                if (!(key in this.parent.inputs)) {
                    throw new Error(`Given parameter object ${JSON.stringify(value)} but destination ${this.parent} has no input named '${key}'. To pass a raw object without changing properties, set _raw: true on the object.`);
                }
            }
            for (let key in value) {
                this.parent.inputs[key].setValue(value[key]);
            }
        }
        else if (this.defaultInput == undefined) {
            throw new Error(`Component ${this.parent} unable to receive input because it has no default input configured. Either connect to one of its named inputs [${Object.keys(this.parent.inputs)}], or send a message as a plain JS object, with one or more input names as keys.`);
        }
        else {
            isPlainObject && delete value._raw;
            this.defaultInput.setValue(value);
        }
    }
}
export class HybridOutput extends AudioRateOutput {
    connect(destination) {
        let { input } = this.getDestinationInfo(destination);
        if (input instanceof AudioRateInput) {
            return AudioRateOutput.prototype.connect.bind(this)(destination);
        }
        else if (input instanceof ControlInput) {
            return ControlOutput.prototype.connect.bind(this)(destination);
        }
        else {
            throw new Error("Unable to connect to " + destination);
        }
    }
    setValue(value) {
        for (let c of this.connections) {
            c.setValue(value);
        }
    }
}
export class BaseComponent extends HandlerMixin {
    constructor() {
        super();
        _BaseComponent_instances.add(this);
        this.outputs = {};
        this.inputs = {};
        // Reserved default inputs.
        this.isBypassed = this._defineControlInput('isBypassed', false);
        this.isMuted = this._defineControlInput('isMuted', false);
        this.triggerInput = this._defineControlInput('triggerInput');
        // Special inputs that are not automatically set as default I/O.
        this._reservedInputs = [this.isBypassed, this.isMuted, this.triggerInput];
        this._reservedOutputs = [];
        this._preventIOOverwrites();
    }
    toString() {
        function _getNames(obj, except) {
            let entries = Object.keys(obj).filter(i => !except.includes(obj[i]));
            if (entries.length == 1) {
                return `${entries.join(", ")}`;
            }
            return `(${entries.join(", ")})`;
        }
        let inp = _getNames(this.inputs, this._reservedInputs);
        let out = _getNames(this.outputs, this._reservedOutputs);
        return `${this._className}(${inp} => ${out})`;
    }
    _now() {
        return this.audioContext.currentTime;
    }
    _validateIsSingleton() {
        const Class = this.constructor;
        if (Class.instanceExists) {
            throw new Error(`Only one instance of ${this.constructor} can exist.`);
        }
        Class.instanceExists = true;
    }
    _preventIOOverwrites() {
        Object.keys(this.inputs).map(__classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_freezeProperty).bind(this));
        Object.keys(this.outputs).map(__classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_freezeProperty).bind(this));
    }
    _defineControlInput(name, defaultValue = _UNSET_VALUE, isRequired = false) {
        let input = new this._.ControlInput(this, defaultValue, isRequired);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, input, this.inputs);
    }
    _defineAudioInput(name, destinationNode) {
        let input = new this._.AudioRateInput(this, destinationNode);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, input, this.inputs);
    }
    _defineHybridInput(name, destinationNode, defaultValue = _UNSET_VALUE, isRequired = false) {
        let input = new this._.HybridInput(this, destinationNode, defaultValue, isRequired);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, input, this.inputs);
    }
    _defineControlOutput(name) {
        let output = new this._.ControlOutput();
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, output, this.outputs);
    }
    _defineAudioOutput(name, audioNode) {
        let output = new this._.AudioRateOutput(audioNode);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, output, this.outputs);
    }
    _defineHybridOutput(name, audioNode) {
        let output = new this._.HybridOutput(audioNode);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, output, this.outputs);
    }
    _setDefaultInput(input) {
        this._defaultInput = input;
    }
    _setDefaultOutput(output) {
        this._defaultOutput = output;
    }
    getDefaultInput() {
        if (this._defaultInput) {
            return new this._.ComponentInput(this, this._defaultInput);
        }
        // Skip reserved inputs, e.g. isMuted / isBypassed
        const ownInputs = Object.values(this.inputs).filter(i => !this._reservedInputs.includes(i));
        if (ownInputs.length == 1) {
            return new this._.ComponentInput(this, ownInputs[0]);
        }
        return new this._.ComponentInput(this);
    }
    getDefaultOutput() {
        if (this._defaultOutput) {
            return this._defaultOutput;
        }
        // Skip reserved outputs
        const ownOutputs = Object.values(this.outputs).filter(i => !this._reservedOutputs.includes(i));
        if (ownOutputs.length == 1) {
            return ownOutputs[0];
        }
    }
    propagateUpdatedInput(inputStream, newValue) {
        if (inputStream == this.isBypassed) {
            this.onBypassEvent(newValue);
        }
        else if (inputStream == this.isMuted) {
            this.onMuteEvent(newValue);
        }
        if (inputStream == this.triggerInput) {
            // Always execute function, even if it's unsafe.
            this.inputDidUpdate(undefined, undefined);
        }
        else if (__classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_allInputsAreDefined).call(this)) {
            this.inputDidUpdate(inputStream, newValue);
        }
    }
    // Abstract methods.
    outputAdded(output) { }
    inputAdded(output) { }
    processEvent(event) {
        // Method describing how an incoming event is mutated before passing to the
        // component outputs.
        return event;
    }
    inputDidUpdate(input, newValue) { }
    setBypassed(isBypassed = true) {
        this.isBypassed.setValue(isBypassed);
    }
    setMuted(isMuted = true) {
        this.isMuted.setValue(isMuted);
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (!input) {
            throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${Object.keys(component.inputs)}]`);
        }
        component && this.outputAdded(input);
        const output = this.getDefaultOutput();
        if (!output) {
            throw new Error(`No default output found for ${this}, so unable to connect to destination: ${component}. Found named outputs: [${Object.keys(this.outputs)}]`);
        }
        output.connect(input);
        return component;
    }
    setValues(valueObj) {
        return this.getDefaultInput().setValue(valueObj);
    }
    wasConnectedTo(other) {
        this.inputAdded(other);
        return other;
    }
    sampleSignal(samplePeriodMs = _GLOBAL_STATE.defaultSamplePeriodMs) {
        return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs));
    }
}
_BaseComponent_instances = new WeakSet(), _BaseComponent_freezeProperty = function _BaseComponent_freezeProperty(propName) {
    Object.defineProperty(this, propName, {
        writable: false,
        configurable: false
    });
}, _BaseComponent_defineInputOrOutput = function _BaseComponent_defineInputOrOutput(propName, inputOrOutput, inputsOrOutputsArray) {
    inputsOrOutputsArray[propName] = inputOrOutput;
    return inputOrOutput;
}, _BaseComponent_allInputsAreDefined = function _BaseComponent_allInputsAreDefined() {
    let violations = [];
    for (let inputName in this.inputs) {
        let input = this.inputs[inputName];
        if (input.isRequired && input.value == _UNSET_VALUE) {
            violations.push(inputName);
        }
    }
    return !violations.length;
    /* if (violations.length) {
      throw new Error(`Unable to run ${this}. The following inputs are marked as required but do not have inputs set: [${violations}]`)
    } */
};
BaseComponent.instanceExists = false;
export class AudioComponent extends BaseComponent {
    constructor(inputNode) {
        super();
        this.input = this._defineAudioInput('input', inputNode);
        if (inputNode instanceof AudioNode) {
            this.output = this._defineAudioOutput('output', inputNode);
        }
        else if (!(inputNode instanceof AudioParam)) {
            throw new Error("AudioComponents must be built from either and AudioNode or AudioParam");
        }
        this._preventIOOverwrites();
    }
}
// TODO: Fix all the displays to work with BaseDisplay.
export class BaseDisplay {
    constructor(component) {
        this.component = component;
    }
    assertInitialized() {
        if (!$) {
            throw new Error("jquery not found.");
        }
    }
    _refreshDisplay(input, newValue) {
        throw new Error("Not implemented!");
    }
}
export class VisualComponent extends BaseComponent {
    constructor() {
        super(...arguments);
        _VisualComponent_instances.add(this);
    }
    addToDom(root) {
        __classPrivateFieldGet(this, _VisualComponent_instances, "m", _VisualComponent_assertDisplayIsUsable).call(this);
        // Display background during load.
        this.$container = $(root);
        // Container
        let height = Number(this.$container.attr('height'));
        let width = Number(this.$container.attr('width'));
        if (!this.$container.hasClass(constants.COMPONENT_CONTAINER_CLASS)) {
            this.$container.addClass(constants.COMPONENT_CONTAINER_CLASS);
            __classPrivateFieldGet(this, _VisualComponent_instances, "m", _VisualComponent_addBypassIndicator).call(this);
            //this.$container.css({ width, height })
        }
        // Main component
        let $component = $(document.createElement('div')).css({ width, height }).addClass('component');
        this.$container.append($component);
        this.display._display($component, width, height);
        return $component;
    }
    refreshDom() {
        throw new Error("TODO: Remove refreshDom. Individual methods should be written instead.");
        __classPrivateFieldGet(this, _VisualComponent_instances, "m", _VisualComponent_assertDisplayIsUsable).call(this);
        if (this.$container) {
            this.display._refreshDisplay(undefined, undefined);
        }
    }
    onMuteEvent(event) {
        if (this.$container) {
            if (event.shouldMute) {
                this.$container.addClass(constants.MUTED_CLASS);
            }
            else {
                this.$container.removeClass(constants.MUTED_CLASS);
            }
        }
    }
    onBypassEvent(event) {
        var _b, _c;
        if (this.$container) {
            if (event.shouldBypass) {
                this.$container.addClass(constants.BYPASSED_CLASS);
                (_b = this.$bypassIndicator) === null || _b === void 0 ? void 0 : _b.show();
            }
            else {
                this.$container.removeClass(constants.BYPASSED_CLASS);
                (_c = this.$bypassIndicator) === null || _c === void 0 ? void 0 : _c.hide();
            }
        }
    }
}
_VisualComponent_instances = new WeakSet(), _VisualComponent_addBypassIndicator = function _VisualComponent_addBypassIndicator() {
    this.$bypassIndicator = $(document.createElement('span'))
        .addClass(constants.BYPASS_INDICATOR_CLASS);
    this.$container.append(this.$bypassIndicator);
}, _VisualComponent_assertDisplayIsUsable = function _VisualComponent_assertDisplayIsUsable() {
    if (this.display == undefined || !(this.display instanceof BaseDisplay)) {
        throw new Error(`No display logic found: invalid ${this._className}.display value. Each VisualComponent must define a 'display' property of type BaseDisplay.`);
    }
    this.display.assertInitialized();
};
export class IgnoreDuplicates extends BaseComponent {
    constructor() {
        super();
        this.input = this._defineControlInput('input');
        this.output = this._defineControlOutput('output');
    }
    inputDidUpdate(input, newValue) {
        if (newValue != this.value) {
            this.output.setValue(newValue);
            this.value = newValue;
        }
    }
}
export class AudioRateSignalSampler extends BaseComponent {
    // Utility for converting an audio-rate signal into a control signal.
    constructor(samplePeriodMs = _GLOBAL_STATE.defaultSamplePeriodMs) {
        super();
        _AudioRateSignalSampler_instances.add(this);
        _AudioRateSignalSampler_interval.set(this, void 0);
        this._analyzer = this.audioContext.createAnalyser();
        // Inputs
        this.samplePeriodMs = this._defineControlInput('samplePeriodMs', samplePeriodMs);
        this.audioInput = this._defineAudioInput('audioInput', this._analyzer);
        this._setDefaultInput(this.audioInput);
        // Output
        this.controlOutput = this._defineControlOutput('controlOutput');
        this._preventIOOverwrites();
    }
    stop() {
        // TODO: figure out how to actually stop this...
        window.clearInterval(__classPrivateFieldGet(this, _AudioRateSignalSampler_interval, "f"));
    }
    inputAdded(input) {
        if (__classPrivateFieldGet(this, _AudioRateSignalSampler_interval, "f")) {
            throw new Error("AudioToControlConverter can only have one input.");
        }
        __classPrivateFieldGet(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_setInterval).call(this, this.samplePeriodMs.value);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.samplePeriodMs) {
            this.stop();
            __classPrivateFieldGet(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_setInterval).call(this, newValue);
        }
    }
}
_AudioRateSignalSampler_interval = new WeakMap(), _AudioRateSignalSampler_instances = new WeakSet(), _AudioRateSignalSampler_getCurrentSignalValue = function _AudioRateSignalSampler_getCurrentSignalValue() {
    const dataArray = new Float32Array(1);
    this._analyzer.getFloatTimeDomainData(dataArray);
    return dataArray[0];
}, _AudioRateSignalSampler_setInterval = function _AudioRateSignalSampler_setInterval(period) {
    __classPrivateFieldSet(this, _AudioRateSignalSampler_interval, window.setInterval(() => {
        try {
            const signal = __classPrivateFieldGet(this, _AudioRateSignalSampler_instances, "m", _AudioRateSignalSampler_getCurrentSignalValue).call(this);
            this.controlOutput.setValue(signal);
        }
        catch (e) {
            this.stop();
            throw e;
        }
    }, period), "f");
};
export class ScrollingAudioMonitorDisplay extends BaseDisplay {
    constructor() {
        super(...arguments);
        _ScrollingAudioMonitorDisplay_instances.add(this);
    }
    _display($container, width, height) {
        let size = {
            width: width,
            height: height,
        };
        this.$canvas = $(document.createElement('canvas')).css(size).attr(size);
        this.$minValueDisplay = $(document.createElement('span'))
            .addClass(constants.MONITOR_VALUE_CLASS)
            .css("bottom", "5px");
        this.$maxValueDisplay = $(document.createElement('span'))
            .addClass(constants.MONITOR_VALUE_CLASS)
            .css("top", "5px");
        $container.append(this.$canvas, this.$minValueDisplay, this.$maxValueDisplay);
        this.$container = $container;
        this.updateWaveformDisplay();
    }
    updateWaveformDisplay() {
        if (this.$container) {
            const { minValue, maxValue } = this.component.getCurrentValueRange();
            this.$minValueDisplay.text(__classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_valueToDisplayableText).call(this, minValue));
            this.$maxValueDisplay.text(__classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_valueToDisplayableText).call(this, maxValue));
            __classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_displayWaveform).call(this, minValue, maxValue);
        }
    }
}
_ScrollingAudioMonitorDisplay_instances = new WeakSet(), _ScrollingAudioMonitorDisplay_valueToDisplayableText = function _ScrollingAudioMonitorDisplay_valueToDisplayableText(value) {
    if (value === "auto") {
        return "";
    }
    else {
        return value.toFixed(2);
    }
}, _ScrollingAudioMonitorDisplay_displayWaveform = function _ScrollingAudioMonitorDisplay_displayWaveform(minValue, maxValue) {
    let maxX = Number(this.$canvas.attr('width'));
    let memory = this.component._memory;
    let entryWidth = maxX / memory.length;
    let maxY = Number(this.$canvas.attr('height'));
    const canvas = this.$canvas[0];
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let hasOutOfBoundsValues = false;
    const toX = (i) => i * entryWidth;
    const toY = (v) => {
        let zeroOneScaled = (v - minValue) / (maxValue - minValue);
        let coordValue = (1 - zeroOneScaled) * maxY;
        hasOutOfBoundsValues = hasOutOfBoundsValues
            || v && ((coordValue > maxY) || (coordValue < 0));
        return coordValue;
    };
    // Draw 0 line
    const zeroY = toY(0);
    if (zeroY <= maxY) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.moveTo(0, zeroY);
        ctx.lineTo(maxX, zeroY);
        ctx.stroke();
    }
    // Draw graph
    ctx.beginPath();
    ctx.strokeStyle = "black";
    for (let i = 0; i < memory.length; i++) {
        if (this.component.hideZeroSignal.value) {
            if (memory[i]) {
                ctx.lineTo(toX(i), toY(memory[i]));
                ctx.stroke();
            }
            else {
                ctx.beginPath();
            }
        }
        else {
            // undefined if out of the memory range.
            if (memory[i] != undefined) {
                ctx.lineTo(toX(i), toY(memory[i]));
                ctx.stroke();
            }
            else {
                ctx.beginPath();
            }
        }
    }
    // Warn user visually if the range of the signal is not captured.
    if (hasOutOfBoundsValues) {
        this.$container.addClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS);
    }
    else {
        this.$container.removeClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS);
    }
};
// TODO: this has a limited sample rate. Instead, develop an "oscilloscope" 
// one that captures N samples and displays them all at the same time.
export class ScrollingAudioMonitor extends VisualComponent {
    constructor(samplePeriodMs = _GLOBAL_STATE.defaultSamplePeriodMs, memorySize = 128, minValue = 'auto', maxValue = 'auto', hideZeroSignal = true) {
        super();
        _ScrollingAudioMonitor_instances.add(this);
        this.display = new this._.ScrollingAudioMonitorDisplay(this);
        this._sampler = new this._.AudioRateSignalSampler(samplePeriodMs);
        this._passthrough = createConstantSource(this.audioContext);
        // Inputs
        this.samplePeriodMs = this._defineControlInput('samplePeriodMs', samplePeriodMs);
        this.memorySize = this._defineControlInput('memorySize', memorySize);
        this.minValue = this._defineControlInput('minValue', minValue);
        this.maxValue = this._defineControlInput('maxValue', maxValue);
        this.hideZeroSignal = this._defineControlInput('hideZeroSignal', hideZeroSignal);
        this.input = this._defineAudioInput('input', this._passthrough.offset);
        this._setDefaultInput(this.input);
        // Output
        this.audioOutput = this._defineAudioOutput('audioOutput', this._passthrough);
        this.controlOutput = this._defineControlOutput('controlOutput');
        // Routing
        this.audioOutput.connect(this._sampler.audioInput);
        this._sampler.controlOutput.onUpdate((v) => {
            __classPrivateFieldGet(this, _ScrollingAudioMonitor_instances, "m", _ScrollingAudioMonitor_addToMemory).call(this, v);
            this.display.updateWaveformDisplay();
            this.controlOutput.setValue(v);
        });
        this._memory = Array(this.memorySize.value).fill(0.);
        this._preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.memorySize) {
            throw new Error("Can't update memorySize yet.");
        }
        else if (input == this.samplePeriodMs) {
            this._sampler.samplePeriodMs.setValue(newValue);
        }
    }
    getCurrentValueRange() {
        let minValue = this.minValue.value == 'auto' ? Math.min(...this._memory) : this.minValue.value;
        let maxValue = this.maxValue.value == 'auto' ? Math.max(...this._memory) : this.maxValue.value;
        let isEmptyRange = (minValue == maxValue);
        if (!Number.isFinite(minValue) || isEmptyRange) {
            minValue = -1;
        }
        if (!Number.isFinite(maxValue) || isEmptyRange) {
            maxValue = 1;
        }
        return { minValue, maxValue };
    }
}
_ScrollingAudioMonitor_instances = new WeakSet(), _ScrollingAudioMonitor_addToMemory = function _ScrollingAudioMonitor_addToMemory(v) {
    this._memory.push(v);
    if (this._memory.length > this.memorySize.value) {
        this._memory.shift();
    }
};
var WaveType;
(function (WaveType) {
    WaveType["SINE"] = "sine";
    WaveType["SQUARE"] = "square";
    WaveType["SAWTOOTH"] = "sawtooth";
    WaveType["TRIANGLE"] = "triangle";
    // TODO: add more
})(WaveType || (WaveType = {}));
export class Wave extends BaseComponent {
    constructor(wavetableOrType, frequency) {
        super();
        let waveType, wavetable;
        if (wavetableOrType instanceof PeriodicWave) {
            wavetable = wavetableOrType;
            waveType = 'custom';
        }
        else if (Object.values(Wave.Type).includes(wavetableOrType)) {
            waveType = wavetableOrType;
        }
        this._oscillatorNode = new OscillatorNode(this.audioContext, {
            type: waveType,
            frequency: frequency,
            periodicWave: wavetable
        });
        this._oscillatorNode.start();
        this.type = this._defineControlInput('type', waveType);
        this.waveTable = this._defineControlInput('waveTable', wavetable);
        this.frequency = this._defineAudioInput('frequency', this._oscillatorNode.frequency);
        this.output = this._defineAudioOutput('output', this._oscillatorNode);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.waveTable) {
            this._oscillatorNode.setPeriodicWave(newValue);
        }
        else if (input == this.type) {
            // TODO: figure this out.
            this._oscillatorNode.type = newValue;
        }
    }
    static fromPartials(frequency, magnitudes, phases) {
        let realCoefficients = [];
        let imagCoefficients = [];
        for (let i = 0; i < magnitudes.length; i++) {
            let theta = (phases && phases[i]) ? phases[i] : 0;
            let r = magnitudes[i];
            realCoefficients.push(r * Math.cos(theta));
            imagCoefficients.push(r * Math.sin(theta));
        }
        // this == class in static contexts.
        return this.fromCoefficients(frequency, realCoefficients, imagCoefficients);
    }
    static fromCoefficients(frequency, real, imaginary) {
        const wavetable = this.audioContext.createPeriodicWave(real, imaginary);
        return new this._.Wave(wavetable, frequency);
    }
}
Wave.Type = WaveType;
// https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
function _getArgs(func) {
    const funcString = func.toString();
    let paramString;
    if (funcString.startsWith('function')) {
        // Normal function
        paramString = funcString
            .replace(/[/][/].*$/mg, '') // strip single-line comments
            .replace(/\s+/g, '') // strip white space
            .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  
            .split('){', 1)[0].replace(/^[^(]*[(]/, ''); // extract the parameters  
    }
    else {
        // Arrow function
        paramString = funcString
            .split('=>')[0]
            .trim()
            .replace(")", "")
            .replace("(", "")
            .trim();
    }
    return _parseParamString(paramString);
}
function _parseParamString(paramString) {
    // Parse the string in between parens including the param names.
    if (paramString) {
        return paramString.split(/\s*,\s*/).filter(Boolean).map(param => {
            let p = param.trim();
            let [name, defaultValueString] = p.split("=");
            return { name, hasDefault: Boolean(defaultValueString) };
        });
    }
    else {
        return [];
    }
}
export class FunctionComponent extends BaseComponent {
    constructor(fn) {
        super();
        _FunctionComponent_instances.add(this);
        this.fn = fn;
        this._orderedFunctionInputs = [];
        let args = _getArgs(fn);
        // TODO: This assumes each input is mono. This should not be a requirement.
        let numChannelsPerInput = 1; // TODO: Have a way of getting this info
        this._audioProcessor = this._createScriptProcessor(args.length, numChannelsPerInput);
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const inputName = "$" + arg.name;
            const isRequired = !arg.hasDefault;
            //
            const passThroughInput = createConstantSource(this.audioContext);
            this[inputName] = this._defineHybridInput(inputName, passThroughInput.offset, _UNSET_VALUE, isRequired);
            for (let c = 0; c < numChannelsPerInput; c++) {
                const fromChannel = c;
                const toChannel = numChannelsPerInput * i + c;
                passThroughInput.connect(this.channelMerger, fromChannel, toChannel);
            }
            //
            // this[inputName] = this._defineHybridInput(inputName, this._audioProcessor, _UNSET_VALUE, isRequired)
            this._orderedFunctionInputs.push(this[inputName]);
        }
        let requiredArgs = args.filter(a => !a.hasDefault);
        if (requiredArgs.length == 1) {
            this._setDefaultInput(this["$" + requiredArgs[0].name]);
        }
        this.output = this._defineHybridOutput('output', this._audioProcessor);
        this._preventIOOverwrites();
    }
    _createScriptProcessor(numInputs, numChannelsPerInput) {
        const bufferSize = undefined; // 256
        let numInputChannels = (numChannelsPerInput * numInputs) || 1;
        this.channelMerger = this.audioContext.createChannelMerger(numInputChannels);
        let processor = this.audioContext.createScriptProcessor(bufferSize, numInputChannels, numChannelsPerInput);
        this.channelMerger.connect(processor);
        function _getTrueChannels(buffer) {
            // Returns an array of length numChannelsPerInput, and the i'th entry
            // contains the i'th channel for each input.
            let inputsGroupedByChannel = [];
            for (let c = 0; c < numChannelsPerInput; c++) {
                let channelData = [];
                for (let i = 0; i < numInputs; i++) {
                    channelData.push(buffer.getChannelData(c * numChannelsPerInput + i));
                }
                inputsGroupedByChannel.push(channelData);
            }
            return inputsGroupedByChannel;
        }
        const handler = e => {
            // Apply the function for each sample in each channel.
            const inputChannels = _getTrueChannels(e.inputBuffer);
            let outputChannels = [];
            for (let c = 0; c < numChannelsPerInput; c++) {
                outputChannels.push(e.outputBuffer.getChannelData(c));
            }
            try {
                __classPrivateFieldGet(this, _FunctionComponent_instances, "m", _FunctionComponent_parallelApplyAcrossChannels).call(this, inputChannels, outputChannels);
            }
            catch (e) {
                processor.removeEventListener('audioprocess', handler);
                throw e;
            }
        };
        processor.addEventListener('audioprocess', handler);
        return processor;
    }
    inputDidUpdate(input, newValue) {
        const args = this._orderedFunctionInputs.map(eachInput => eachInput.value);
        const result = this.fn(...args);
        this.output.setValue(result);
    }
    process(event) {
        return this.fn(event);
    }
    call(...inputs) {
        if (inputs.length > this._orderedFunctionInputs.length) {
            throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this._orderedFunctionInputs.length} but got ${inputs.length}.`);
        }
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].connect(this._orderedFunctionInputs[i]);
        }
        return this;
    }
}
_FunctionComponent_instances = new WeakSet(), _FunctionComponent_parallelApplyAcrossChannels = function _FunctionComponent_parallelApplyAcrossChannels(inputChannels, outputChannels) {
    for (let c = 0; c < inputChannels.length; c++) {
        let outputChannel = outputChannels[c];
        const inputChannel = inputChannels[c];
        for (let i = 0; i < outputChannel.length; i++) {
            // For the current sample and channel, apply the function across the
            // inputs.
            const inputs = inputChannel.map(inp => inp[i]);
            const res = this.fn(...inputs);
            if (typeof res != 'number') {
                throw new Error("FunctionComponents that operate on audio-rate inputs must return numbers. Given: " + (typeof res));
            }
            outputChannel[i] = res;
        }
    }
};
var TimeMeasure;
(function (TimeMeasure) {
    TimeMeasure["CYCLES"] = "cycles";
    TimeMeasure["SECONDS"] = "seconds";
})(TimeMeasure || (TimeMeasure = {}));
// 
export class TimeVaryingSignal extends FunctionComponent {
    constructor(generatorFn, timeMeasure = TimeMeasure.SECONDS) {
        super(generatorFn);
        if (this._orderedFunctionInputs.length != 1) {
            throw new Error(`A time-varying signal function can only have one argument. Given ${this.fn}`);
        }
        const timeRamp = this.defineTimeRamp(timeMeasure);
        timeRamp.connect(this.channelMerger, 0, 0);
        this._preventIOOverwrites();
    }
    defineTimeRamp(timeMeasure) {
        // Continuous ramp representing the AudioContext time.
        let multiplier = timeMeasure == TimeMeasure.CYCLES ? 2 * Math.PI : 1;
        let timeRamp = createConstantSource(this.audioContext);
        let currTime = this._now();
        let endTime = 1e8;
        timeRamp.offset.setValueAtTime(multiplier * currTime, currTime);
        timeRamp.offset.linearRampToValueAtTime(multiplier * endTime, endTime);
        return timeRamp;
    }
}
// TODO: is this old code? Or maybe we should actually expose these functions.
export class AudioParamControlOutput extends ControlOutput {
    constructor() {
        super(...arguments);
        _AudioParamControlOutput_instances.add(this);
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (input instanceof AudioRateInput) {
            this.connections.push(destination);
        }
        else {
            throw new Error("The output must be an audio-rate input.");
        }
        return destination;
    }
    cancelAndHoldAtTime(cancelTime) {
        __classPrivateFieldGet(this, _AudioParamControlOutput_instances, "m", _AudioParamControlOutput_map).call(this, 'cancelAndHoldAtTime', arguments);
    }
    cancelScheduledValues(cancelTime) {
        __classPrivateFieldGet(this, _AudioParamControlOutput_instances, "m", _AudioParamControlOutput_map).call(this, 'cancelScheduledValues', arguments);
    }
    exponentialRampToValueAtTime(value, endTime) {
        __classPrivateFieldGet(this, _AudioParamControlOutput_instances, "m", _AudioParamControlOutput_map).call(this, 'exponentialRampToValueAtTime', arguments);
    }
    linearRampToValueAtTime(value, endTime) {
        __classPrivateFieldGet(this, _AudioParamControlOutput_instances, "m", _AudioParamControlOutput_map).call(this, 'linearRampToValueAtTime', arguments);
    }
    setTargetAtTime(value, startTime, timeConstant) {
        __classPrivateFieldGet(this, _AudioParamControlOutput_instances, "m", _AudioParamControlOutput_map).call(this, 'setTargetAtTime', arguments);
    }
    setValueAtTime(value, startTime) {
        __classPrivateFieldGet(this, _AudioParamControlOutput_instances, "m", _AudioParamControlOutput_map).call(this, 'setValueAtTime', arguments);
    }
    setValueCurveAtTime(values, startTime, duration) {
        __classPrivateFieldGet(this, _AudioParamControlOutput_instances, "m", _AudioParamControlOutput_map).call(this, 'setValueCurveAtTime', arguments);
    }
}
_AudioParamControlOutput_instances = new WeakSet(), _AudioParamControlOutput_map = function _AudioParamControlOutput_map(fn, args) {
    for (let connection of this.connections) {
        connection[fn](...args);
    }
};
export class RangeInputDisplay extends BaseDisplay {
    updateValue(value) { }
    updateMinValue(value) { }
    updateMaxValue(value) { }
    updateStep(value) { }
}
export class KnobDisplay extends RangeInputDisplay {
    _display($root, width, height) {
        throw new Error("Not implemented!");
    }
}
export class SliderDisplay extends RangeInputDisplay {
    constructor() {
        super(...arguments);
        _SliderDisplay_instances.add(this);
    }
    _display($root, width, height) {
        this.$range = $(document.createElement('input'))
            .attr(__classPrivateFieldGet(this, _SliderDisplay_instances, "m", _SliderDisplay_getInputAttrs).call(this))
            .on('input', event => {
            this.component.output.setValue(Number(event.target.value));
        }).css({
            width: width,
            height: height,
        });
        $root.append(this.$range);
    }
    updateValue(value) {
        var _b;
        (_b = this.$range) === null || _b === void 0 ? void 0 : _b.attr('value', value);
    }
    updateMinValue(value) {
        var _b;
        (_b = this.$range) === null || _b === void 0 ? void 0 : _b.attr('min', value);
    }
    updateMaxValue(value) {
        var _b;
        (_b = this.$range) === null || _b === void 0 ? void 0 : _b.attr('max', value);
    }
    updateStep(value) {
        var _b;
        (_b = this.$range) === null || _b === void 0 ? void 0 : _b.attr('step', value);
    }
}
_SliderDisplay_instances = new WeakSet(), _SliderDisplay_getInputAttrs = function _SliderDisplay_getInputAttrs() {
    return {
        type: 'range',
        min: this.component.minValue.value,
        max: this.component.maxValue.value,
        step: this.component.step.value || 'any',
        value: this.component.input.value,
    };
};
export var RangeType;
(function (RangeType) {
    RangeType["SLIDER"] = "slider";
    RangeType["KNOB"] = "knob";
})(RangeType || (RangeType = {}));
export class RangeInputComponent extends VisualComponent {
    constructor(minValue = -1, maxValue = 1, step, defaultValue, displayType = RangeType.SLIDER) {
        super();
        this.display = (displayType == RangeType.SLIDER)
            ? new this._.SliderDisplay(this)
            : new this._.KnobDisplay(this);
        if (defaultValue == undefined) {
            defaultValue = (minValue + maxValue) / 2;
        }
        // Inputs
        this.minValue = this._defineControlInput('minValue', minValue);
        this.maxValue = this._defineControlInput('maxValue', maxValue);
        this.step = this._defineControlInput('step', step);
        this.input = this._defineControlInput('input', defaultValue);
        this._setDefaultInput(this.input);
        // Output
        this.output = this._defineControlOutput('output');
    }
    inputDidUpdate(input, newValue) {
        if (input == this.input) {
            this.display.updateValue(newValue);
            this.output.setValue(newValue);
        }
        else if (input == this.minValue) {
            this.display.updateMinValue(newValue);
        }
        else if (input == this.maxValue) {
            this.display.updateMaxValue(newValue);
        }
        else if (input == this.step) {
            this.display.updateStep(newValue);
        }
    }
}
RangeInputComponent.Type = RangeType;
/* class ADSRControl extends BaseComponent {
  constructor(attackDurationMs, decayDurationMs, sustainAmplitude, releaseDurationMs) {
    this.attackDurationMs = this._defineControlInput('attackDurationMs', attackDurationMs)
    this.decayDurationMs = this._defineControlInput('decayDurationMs', decayDurationMs)
    this.sustainAmplitude = this._defineControlInput('sustainAmplitude', sustainAmplitude)
    this.releaseDurationMs = this._defineControlInput('releaseDurationMs', releaseDurationMs)
  }
} */
export class ADSR extends BaseComponent {
    constructor(attackDurationMs, decayDurationMs, sustainAmplitude, releaseDurationMs) {
        super();
        // Inputs
        this.attackEvent = this._defineControlInput('attackEvent');
        this.releaseEvent = this._defineControlInput('releaseEvent');
        this.attackDurationMs = this._defineControlInput('attackDurationMs', attackDurationMs);
        this.decayDurationMs = this._defineControlInput('decayDurationMs', decayDurationMs);
        this.sustainAmplitude = this._defineControlInput('sustainAmplitude', sustainAmplitude);
        this.releaseDurationMs = this._defineControlInput('releaseDurationMs', releaseDurationMs);
        this._paramModulator = createConstantSource(this.audioContext);
        this.audioOutput = this._defineAudioOutput('audioOutput', this._paramModulator);
        this.state = { noteStart: 0, attackFinish: 0, decayFinish: 0 };
        this._preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        const state = this.state;
        if (input == this.attackEvent) {
            state.noteStart = this._now();
            this._paramModulator.offset.cancelScheduledValues(state.noteStart);
            state.attackFinish = state.noteStart + this.attackDurationMs.value / 1000;
            state.decayFinish = state.attackFinish + this.decayDurationMs.value / 1000;
            this._paramModulator.offset.setValueAtTime(0, state.noteStart);
            this._paramModulator.offset.linearRampToValueAtTime(1.0, state.attackFinish);
            // Starts *after* the previous event finishes.
            this._paramModulator.offset.linearRampToValueAtTime(this.sustainAmplitude.value, state.decayFinish);
            this._paramModulator.offset.setValueAtTime(this.sustainAmplitude.value, state.decayFinish);
        }
        else if (input == this.releaseEvent) {
            const releaseStart = this._now();
            let releaseFinish;
            if (releaseStart > state.attackFinish && releaseStart < state.decayFinish) {
                // Special case: the amplitude is in the middle of increasing. If we 
                // immediately release, we risk the note being louder *longer* than if 
                // it was allowed to decay, in the case that the release is longer than 
                // the decay and sustain < 1. So, let it decay, then release.
                releaseFinish = state.decayFinish + this.releaseDurationMs.value / 1000;
            }
            else {
                // Immediately release.
                this._paramModulator.offset.cancelScheduledValues(releaseStart);
                this._paramModulator.offset.setValueAtTime(this._paramModulator.offset.value, releaseStart);
                releaseFinish = releaseStart + this.releaseDurationMs.value / 1000;
            }
            this._paramModulator.offset.linearRampToValueAtTime(0.0, releaseFinish);
        }
    }
}
export class KeyboardDisplay extends BaseDisplay {
    constructor() {
        super(...arguments);
        this.$keys = {};
    }
    _display($root, width, height) {
        // Obviously this is the wrong keyboard arrangement. TODO: that.
        let keyWidth = width / this.component.numKeys.value;
        this.$keys = {};
        const lo = this.component.lowestPitch.value;
        const hi = this.component.highestPitch;
        for (let pitch = lo; pitch < hi; pitch++) {
            let $key = $(document.createElement('button'))
                .addClass(constants.KEYBOARD_KEY_CLASS)
                .css({
                width: keyWidth,
                height: height,
            })
                .attr('type', 'button')
                // Keydown handled locally
                .on(constants.EVENT_MOUSEDOWN, () => this.component._keyDown(pitch));
            this.$keys[pitch] = $key;
            $root.append($key);
        }
        // Key releases are handled globally to prevent releasing when not on a 
        // button (doesn't trigger mouseup on the button).
        // TODO: isn't this inefficient to propogate 48 updates on one keydown...? 
        $root.on(constants.EVENT_MOUSEUP, () => {
            Object.keys(this.$keys).forEach(k => this.component._keyUp(k));
        });
    }
    showKeyEvent(event) {
        let $key = this.$keys[event.eventPitch];
        if ($key) {
            if (event.eventType == KeyEventType.KEY_DOWN) {
                $key.addClass(constants.KEYBOARD_KEY_PRESSED_CLASS);
            }
            else {
                $key.removeClass(constants.KEYBOARD_KEY_PRESSED_CLASS);
            }
        }
    }
}
export class Keyboard extends VisualComponent {
    constructor(numKeys = 48, lowestPitch = 48) {
        super();
        _Keyboard_instances.add(this);
        this.display = new this._.KeyboardDisplay(this);
        // Inputs
        this.numKeys = this._defineControlInput('numKeys', numKeys);
        this.lowestPitch = this._defineControlInput('lowestPitch', lowestPitch);
        this.midiInput = this._defineControlInput('midiInput');
        this._setDefaultInput(this.midiInput);
        // Output
        this.midiOutput = this._defineControlOutput('midiOutput');
        this._preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.numKeys || input == this.lowestPitch) {
            //this.refreshDom()
            throw new Error("Can't update numKeys or lowestPitch yet.");
        }
        if (input == this.midiInput) {
            // Show key being pressed.
            this.display.showKeyEvent(newValue);
            // Propagate.
            this.midiOutput.setValue(newValue);
        }
    }
    get highestPitch() {
        return this.lowestPitch.value + this.numKeys.value;
    }
    _keyDown(keyNumber) {
        this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_DOWN, keyNumber, 64, __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_getKeyId).call(this, keyNumber)));
    }
    _keyUp(keyNumber) {
        this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_UP, keyNumber, 64, __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_getKeyId).call(this, keyNumber)));
    }
}
_Keyboard_instances = new WeakSet(), _Keyboard_getKeyId = function _Keyboard_getKeyId(keyNumber) {
    return `${this._uuid}-k${keyNumber}`; // Unique identifier.
};
const _MIDI_C0 = 12;
export class TypingKeyboardMIDI extends BaseComponent {
    constructor(velocity = 64, octave = 4) {
        super();
        _TypingKeyboardMIDI_instances.add(this);
        // Inputs
        this.velocity = this._defineControlInput('velocity', velocity);
        this.octaveInput = this._defineControlInput('octaveInput', octave);
        this.midiInput = this._defineControlInput('midiInput', _UNSET_VALUE, false);
        this._setDefaultInput(this.midiInput);
        // Output
        this.midiOutput = this._defineControlOutput('midiOutput');
        this.octaveOutput = this._defineControlOutput('octaveOutput');
        this._setDefaultOutput(this.midiOutput);
        this._preventIOOverwrites();
        this._validateIsSingleton();
        __classPrivateFieldGet(this, _TypingKeyboardMIDI_instances, "m", _TypingKeyboardMIDI_registerKeyHandlers).call(this);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.octaveInput) {
            this.octaveOutput.setValue(newValue);
        }
        else if (input == this.midiInput) {
            // Passthrough, as MIDI does not affect component state.
            this.midiOutput.setValue(newValue);
        }
    }
}
_a = TypingKeyboardMIDI, _TypingKeyboardMIDI_instances = new WeakSet(), _TypingKeyboardMIDI_registerKeyHandlers = function _TypingKeyboardMIDI_registerKeyHandlers() {
    const keyPressedMap = {};
    const processKeyEvent = (event) => {
        var _b;
        if (event.defaultPrevented) {
            return;
        }
        const key = event.key;
        const isAlreadyPressed = (_b = keyPressedMap[key]) === null || _b === void 0 ? void 0 : _b.isPressed;
        const isKeyDown = (event.type == KeyEventType.KEY_DOWN);
        let pitch;
        if (isAlreadyPressed) {
            if (isKeyDown) {
                // Extra keydown events are sent for holding, so ignore.
                return;
            }
            else {
                // The pitch of the press may be different than the current pitch,
                // so send a note-off for that one instead.
                pitch = keyPressedMap[key].pitch;
            }
        }
        else {
            pitch = __classPrivateFieldGet(this, _TypingKeyboardMIDI_instances, "m", _TypingKeyboardMIDI_getPitchFromKey).call(this, key, isKeyDown);
        }
        if (pitch != undefined) {
            keyPressedMap[key] = {
                isPressed: isKeyDown,
                pitch: pitch
            };
            let id = this._uuid + key + pitch;
            this.midiOutput.setValue(new KeyEvent(event.type, pitch, this.velocity.value, id));
        }
    };
    window.addEventListener("keydown", processKeyEvent, true);
    window.addEventListener("keyup", processKeyEvent, true);
}, _TypingKeyboardMIDI_getPitchFromKey = function _TypingKeyboardMIDI_getPitchFromKey(key, isKeyDown) {
    const baseCPitch = _MIDI_C0 + this.octaveInput.value * 12;
    const chromaticIdx = _a.CHROMATIC_KEY_SEQUENCE.indexOf(key);
    if (chromaticIdx != -1) {
        return chromaticIdx + baseCPitch;
    }
    else if (isKeyDown && key == _a.OCTAVE_DOWN_KEY) {
        // The octaveOutput will automatically be updated
        this.octaveInput.setValue(this.octaveInput.value - 1);
    }
    else if (isKeyDown && key == _a.OCTAVE_UP_KEY) {
        this.octaveInput.setValue(this.octaveInput.value + 1);
    }
};
TypingKeyboardMIDI.OCTAVE_DOWN_KEY = "z";
TypingKeyboardMIDI.OCTAVE_UP_KEY = "x";
TypingKeyboardMIDI.CHROMATIC_KEY_SEQUENCE = "awsedftgyhujkolp;'"; // C to F
export class BangDisplay extends BaseDisplay {
    _display($root, width, height) {
        let $button = $(document.createElement('button'))
            .on('click', () => {
            this.component.trigger();
        }).css({
            width: width,
            height: height,
        })
            .attr('type', 'button');
        $root.append($button);
    }
}
export class Bang extends VisualComponent {
    constructor() {
        super();
        this.display = new this._.BangDisplay(this);
        this.output = this._defineControlOutput('output');
        this._preventIOOverwrites();
    }
    connect(destination) {
        let { component } = this.getDestinationInfo(destination);
        if (destination instanceof ControlInput) {
            this.output.connect(destination);
        }
        else {
            this.output.connect(component.triggerInput);
        }
        return component;
    }
    trigger() {
        this.output.setValue(TRIGGER);
    }
}
const _GLOBAL_STATE = {
    isInitialized: false,
    audioContext: null,
    defaultSamplePeriodMs: 10
};
export class SimplePolyphonicSynth extends BaseComponent {
    constructor(numNotes = 4, waveform = 'sine') {
        super();
        _SimplePolyphonicSynth_instances.add(this);
        this._soundNodes = [];
        this._currNodeIdx = 0;
        this._masterGainNode = this.audioContext.createGain();
        // Inputs
        this.numNotes = this._defineControlInput('numNotes', numNotes);
        this.waveform = this._defineControlInput('waveform', waveform);
        this.midiInput = this._defineControlInput('midiInput');
        this._setDefaultInput(this.midiInput);
        // Output
        this.audioOutput = this._defineAudioOutput('audioOutput', this._masterGainNode);
        for (let i = 0; i < numNotes; i++) {
            this._soundNodes.push(__classPrivateFieldGet(this, _SimplePolyphonicSynth_instances, "m", _SimplePolyphonicSynth_createOscillatorGraph).call(this, this.waveform.value));
        }
        this._preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.midiInput) {
            this.onKeyEvent(newValue);
        }
        // TODO: fill in the rest.
    }
    onKeyEvent(event) {
        // Need better solution than this.
        let freq = 440 * Math.pow(2, ((event.eventPitch - 69) / 12));
        if (event.eventType == KeyEventType.KEY_DOWN) {
            let node = this._soundNodes[this._currNodeIdx];
            node.isPlaying && node.oscillator.stop();
            node.oscillator = this.audioContext.createOscillator();
            node.oscillator.connect(node.gainNode);
            node.oscillator.frequency.value = freq;
            node.gainNode.gain.value = event.eventVelocity / 128;
            node.oscillator.start();
            node.key = event.key;
            node.isPlaying = true;
            this._currNodeIdx = (this._currNodeIdx + 1) % this.numNotes.value;
        }
        else if (event.eventType == KeyEventType.KEY_UP) {
            for (let node of this._soundNodes) {
                if (event.key && (event.key == node.key)) {
                    node.oscillator.stop();
                    node.isPlaying = false;
                }
            }
        }
        else {
            throw new Error("invalid keyevent");
        }
    }
}
_SimplePolyphonicSynth_instances = new WeakSet(), _SimplePolyphonicSynth_createOscillatorGraph = function _SimplePolyphonicSynth_createOscillatorGraph(waveform) {
    let oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    let gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this._masterGainNode);
    this._masterGainNode.gain.setValueAtTime(1 / this.numNotes.value, this._now());
    return {
        oscillator: oscillator,
        gainNode: gainNode,
        isPlaying: false,
        // Unique identifier to help associate NOTE_OFF events with the correct
        // oscillator.
        key: undefined
    };
};
