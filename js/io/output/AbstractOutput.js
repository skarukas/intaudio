import { BaseConnectable } from "../../shared/base/BaseConnectable.js";
import { createTypeValidator, wrapValidator } from "../../shared/util.js";
export class AbstractOutput extends BaseConnectable {
    constructor(name, parent) {
        super();
        this.name = name;
        this.parent = parent;
        this.validate = () => null;
        this.connections = {};
        this.callbacks = [];
    }
    ofType(type) {
        this.withValidator(createTypeValidator(type));
        return this;
    }
    toString() {
        if (this.parent == undefined) {
            return `${this._className}('${this.name}')`;
        }
        return `${this.parent._className}.outputs.${this.name}`;
    }
    get defaultOutput() {
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
