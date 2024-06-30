import { BaseConnectable } from "../../shared/base/BaseConnectable.js";
export class AbstractOutput extends BaseConnectable {
    constructor(name) {
        super();
        this.name = name;
        this.connections = [];
        this.callbacks = [];
    }
}
