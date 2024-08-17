import { AbstractInput } from "../../io/input/AbstractInput.js";
import { TypedConfigurable } from "../config.js";
import { StreamSpec } from "../StreamSpec.js";
import { isComponent, isFunction, isType } from "../util.js";
import { ToStringAndUUID } from "./ToStringAndUUID.js";
export class BaseConnectable extends ToStringAndUUID {
    get isAudioStream() {
        return this.defaultOutput instanceof this._.AudioRateOutput;
    }
    get isStftStream() {
        return this.defaultOutput instanceof this._.FFTOutput;
    }
    get isControlStream() {
        return this.defaultOutput instanceof this._.ControlOutput;
    }
    getDestinationInfo(destination) {
        if (isFunction(destination)) {
            if (this.isControlStream) {
                destination = new this._.FunctionComponent(destination);
            }
            else {
                // TODO: move away from ths unsafe conversion...or make sure it's safe 
                // by ensuring it's either BaseComponent or AudioRateOutput?
                const numInputChannels = this.numOutputChannels;
                destination = new this._.AudioTransformComponent(destination, {
                    inputSpec: new StreamSpec({
                        numChannelsPerStream: [numInputChannels]
                    })
                });
            }
        }
        let component;
        let input;
        if (isType(destination, [AudioNode, AudioParam])) {
            component = new this._.AudioComponent(destination);
            input = component.getDefaultInput();
        }
        else if (isType(destination, AbstractInput)) {
            // TODO: can this typing issue be fixed? isType not working with abstract
            // classes.
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
