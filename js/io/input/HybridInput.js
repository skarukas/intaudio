var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AbstractInput } from "./AbstractInput.js";
import constants from "../../shared/constants.js";
import { createMultiChannelView, getNumInputChannels } from "../../shared/multichannel.js";
import { resolvePromiseArgs } from "../../shared/decorators.js";
import { isType } from "../../shared/util.js";
// TODO: remove this and HybridOutput.
export class HybridInput extends AbstractInput {
    get numInputChannels() {
        return this.activeChannel ? 1 : getNumInputChannels(this.audioSink);
    }
    // Hybrid input can connect an audio input to a sink, but it also can
    // receive control inputs.
    constructor(name, parent, audioSink, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        super(name, parent, isRequired);
        this.name = name;
        this.parent = parent;
        this.audioSink = audioSink;
        this.isRequired = isRequired;
        this.activeChannel = undefined;
        this._value = defaultValue;
        this.channels = createMultiChannelView(this, audioSink instanceof AudioNode);
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get value() {
        return this._value;
    }
    setValue(value) {
        var _a;
        value = value;
        this.validate(value);
        if (value == constants.TRIGGER && this.value != undefined) {
            value = this.value;
        }
        this._value = value;
        if (isFinite(+value) && isType(this.audioSink, AudioParam)) {
            this.audioSink.setValueAtTime(+value, 0);
        }
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.propagateUpdatedInput(this, value);
    }
}
__decorate([
    resolvePromiseArgs
], HybridInput.prototype, "setValue", null);
