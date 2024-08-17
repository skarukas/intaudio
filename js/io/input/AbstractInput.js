import { ToStringAndUUID } from "../../shared/base/ToStringAndUUID.js";
import constants from "../../shared/constants.js";
import { createTypeValidator, wrapValidator } from "../../shared/util.js";
export class AbstractInput extends ToStringAndUUID {
    constructor(name, parent, isRequired) {
        super();
        this.name = name;
        this.parent = parent;
        this.isRequired = isRequired;
        this.validate = () => null;
    }
    get defaultInput() {
        return this;
    }
    get isAudioStream() {
        return this.defaultInput instanceof this._.AudioRateInput;
    }
    get isStftStream() {
        return this.defaultInput instanceof this._.FFTInput;
    }
    get isControlStream() {
        return this.defaultInput instanceof this._.ControlInput;
    }
    __call__(value = constants.TRIGGER) {
        this.setValue(value);
    }
    trigger() {
        this.setValue(constants.TRIGGER);
    }
    toString() {
        if (this.parent == undefined) {
            return `${this._className}('${this.name}')`;
        }
        return `${this.parent._className}.inputs.${this.name}`;
    }
    ofType(type) {
        this.withValidator(createTypeValidator(type));
        return this;
    }
    /**
     * The validator function can either throw an error or return false.
     */
    withValidator(validatorFn) {
        this.validate = wrapValidator(validatorFn);
        return this;
    }
}
