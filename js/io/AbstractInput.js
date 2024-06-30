import constants from "../shared/constants.js";
export class AbstractInput extends ToStringAndUUID {
    constructor(parent, isRequired) {
        super();
        this.parent = parent;
        this.isRequired = isRequired;
    }
    trigger() {
        this.setValue(constants.TRIGGER);
    }
}
