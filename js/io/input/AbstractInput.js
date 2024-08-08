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
    __call__(value = constants.TRIGGER) {
        this.setValue(value);
    }
    trigger() {
        this.setValue(constants.TRIGGER);
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
