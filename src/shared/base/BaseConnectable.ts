import { Component } from "../../components/base/Component.js";
import { AbstractInput } from "../../io/input/AbstractInput.js";
import { AbstractOutput } from "../../io/output/AbstractOutput.js";
import { TypedConfigurable } from "../config.js";
import { CanBeConnectedTo, WebAudioConnectable } from "../types.js";
import { isComponent, isFunction, isType } from "../util.js";
import { Connectable } from "./Connectable.js";
import { ToStringAndUUID } from "./ToStringAndUUID.js";


export abstract class BaseConnectable extends ToStringAndUUID implements Connectable {
  abstract connect<T extends Component>(destination: T): T;
  abstract connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
  abstract get defaultOutput(): AbstractOutput | undefined;

  get isAudioStream(): boolean {
    return this.defaultOutput instanceof this._.AudioRateOutput
  }
  get isStftStream(): boolean {
    return this.defaultOutput instanceof this._.FFTOutput
  }
  get isControlStream(): boolean {
    return this.defaultOutput instanceof this._.ControlOutput
  }

  getDestinationInfo(
    destination: CanBeConnectedTo
  ): { component: Component | undefined, input: AbstractInput } {
    if (isFunction(destination)) {
      destination = this.isControlStream ? new this._.FunctionComponent(<Function>destination) : new this._.AudioTransformComponent(<Function>destination)
    }
    let component: Component | undefined
    let input: AbstractInput
    if (isType(destination, [AudioNode, AudioParam])) {
      component = new this._.AudioComponent(<WebAudioConnectable>destination)
      input = component.getDefaultInput()
    } else if (isType(destination, <any>AbstractInput)) {
      // TODO: can this typing issue be fixed? isType not working with abstract
      // classes.
      component = (<AbstractInput>destination).parent
      input = <AbstractInput>destination
    } else if (isComponent(destination)) {
      component = <Component>destination
      input = component.getDefaultInput()
    } else {
      throw new Error("Improper input type for connect(). " + destination)
    }
    if (destination instanceof TypedConfigurable && destination.configId != this.configId) {
      throw new Error(`Unable to connect components from different namespaces. Given ${this} (config ID: ${this.configId}) and ${destination} (config ID: ${destination.configId})`)
    }
    return { component, input }
  }
}