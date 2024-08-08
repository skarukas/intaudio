import CallableInstance from "callable-instance";
export class TypedConfigurable extends CallableInstance {
    constructor() {
        super("__call__");
        Object.defineProperty(this, 'name', {
            value: this.constructor.name,
            writable: true,
            configurable: true
        });
    }
    __call__(__forbiddenCall) {
        throw new Error(`Object of type ${this.constructor.name} is not a function.`);
    }
}
