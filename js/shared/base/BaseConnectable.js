import { AbstractInput } from "../../io/input/AbstractInput.js";
import { TypedConfigurable } from "../config.js";
import { isComponent, isFunction } from "../util.js";
import { ToStringAndUUID } from "./ToStringAndUUID.js";
export class BaseConnectable extends ToStringAndUUID {
    getDestinationInfo(destination) {
        if (isFunction(destination)) {
            destination = new this._.FunctionComponent(destination);
        }
        let component, input;
        if ((destination instanceof AudioNode)
            || (destination instanceof AudioParam)) {
            component = new this._.AudioComponent(destination);
            input = component.getDefaultInput();
        }
        else if (destination instanceof AbstractInput) {
            component = destination.parent;
            input = destination;
        }
        else if (isComponent(destination)) {
            component = destination;
            input = component.getDefaultInput();
        }
        else {
            throw new Error("Improper input type for connect(). " + destination);
        }
        if (destination instanceof TypedConfigurable && destination.configId != this.configId) {
            throw new Error(`Unable to connect components from different namespaces. Given ${this} (config ID: ${this.configId}) and ${destination} (config ID: ${destination.configId})`);
        }
        return { component, input };
    }
}
