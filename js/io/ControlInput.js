import { AbstractInput } from "./AbstractInput.js";
import constants from "../shared/constants.js";
export class ControlInput extends AbstractInput {
    constructor(parent, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        super(parent, isRequired);
        this._value = defaultValue;
    }
    get value() {
        return this._value;
    }
    setValue(value) {
        var _a;
        if (value == constants.TRIGGER && this.value != undefined) {
            value = this.value;
        }
        this._value = value;
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.propagateUpdatedInput(this, value);
    }
}
