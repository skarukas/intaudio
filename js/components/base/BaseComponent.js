var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BaseComponent_instances, _BaseComponent_freezeProperty, _BaseComponent_defineInputOrOutput, _BaseComponent_allInputsAreDefined;
import { BaseConnectable } from "../../shared/base/BaseConnectable.js";
import constants from "../../shared/constants.js";
export class BaseComponent extends BaseConnectable {
    constructor() {
        super();
        _BaseComponent_instances.add(this);
        this.isComponent = true;
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
    _defineControlInput(name, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        let input = new this._.ControlInput(name, this, defaultValue, isRequired);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, input, this.inputs);
    }
    _defineAudioInput(name, destinationNode) {
        let input = new this._.AudioRateInput(name, this, destinationNode);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, input, this.inputs);
    }
    _defineHybridInput(name, destinationNode, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        let input = new this._.HybridInput(name, this, destinationNode, defaultValue, isRequired);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, input, this.inputs);
    }
    _defineControlOutput(name) {
        let output = new this._.ControlOutput(name);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, output, this.outputs);
    }
    _defineAudioOutput(name, audioNode) {
        let output = new this._.AudioRateOutput(name, audioNode);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, output, this.outputs);
    }
    _defineHybridOutput(name, audioNode) {
        let output = new this._.HybridOutput(name, audioNode);
        return __classPrivateFieldGet(this, _BaseComponent_instances, "m", _BaseComponent_defineInputOrOutput).call(this, name, output, this.outputs);
    }
    _setDefaultInput(input) {
        this._defaultInput = input;
    }
    _setDefaultOutput(output) {
        this._defaultOutput = output;
    }
    getDefaultInput() {
        const name = 'default';
        if (this._defaultInput) {
            return new this._.ComponentInput(name, this, this._defaultInput);
        }
        // Skip reserved inputs, e.g. isMuted / isBypassed
        const ownInputs = Object.values(this.inputs).filter(i => !this._reservedInputs.includes(i));
        if (ownInputs.length == 1) {
            return new this._.ComponentInput(name, this, ownInputs[0]);
        }
        return new this._.ComponentInput(name, this);
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
        else {
            console.warn("Not passing event because not all required inputs are defined.");
        }
    }
    // Abstract methods.
    outputAdded(output) { }
    inputAdded(output) { }
    onBypassEvent(event) { }
    onMuteEvent(event) { }
    inputDidUpdate(input, newValue) { }
    processEvent(event) {
        // Method describing how an incoming event is mutated before passing to the
        // component outputs.
        return event;
    }
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
    sampleSignal(samplePeriodMs) {
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
        if (input.isRequired && input.value == constants.UNSET_VALUE) {
            violations.push(inputName);
        }
    }
    return !violations.length;
    /* if (violations.length) {
      throw new Error(`Unable to run ${this}. The following inputs are marked as required but do not have inputs set: [${violations}]`)
    } */
};
BaseComponent.instanceExists = false;
