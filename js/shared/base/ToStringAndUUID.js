import { TypedConfigurable } from "../config.js";
export class ToStringAndUUID extends TypedConfigurable {
    constructor() {
        super();
        this._uuid = crypto.randomUUID();
    }
    get _className() {
        return this.constructor.name == '_Configured' ?
            Object.getPrototypeOf(Object.getPrototypeOf(this)).constructor.name
            : this.constructor.name;
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
