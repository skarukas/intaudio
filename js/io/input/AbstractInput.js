import { ToStringAndUUID } from "../../shared/base/ToStringAndUUID.js";
import constants from "../../shared/constants.js";
export class AbstractInput extends ToStringAndUUID {
    constructor(name, parent, isRequired) {
        super();
        this.name = name;
        this.parent = parent;
        this.isRequired = isRequired;
    }
    trigger() {
        this.setValue(constants.TRIGGER);
    }
}
