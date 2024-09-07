var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import constants from "../../shared/constants.js";
import { resolvePromiseArgs } from "../../shared/decorators.js";
import { AbstractInput } from "./AbstractInput.js";
export class ControlInput extends AbstractInput {
    constructor(name, parent, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        super(name, parent, isRequired);
        this.name = name;
        this.numInputChannels = 1;
        this._value = defaultValue;
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
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.propagateUpdatedInput(this, value);
    }
}
__decorate([
    resolvePromiseArgs
], ControlInput.prototype, "setValue", null);
