import { BaseComponent } from "../../components/base/BaseComponent.js";
import { Component } from "../../components/base/Component.js";
import { AbstractInput } from "../../io/input/AbstractInput.js";
import { TypedConfigurable } from "../config.js";
import { CanBeConnectedTo } from "../types.js";
import { isComponent } from "../util.js";
import { Connectable } from "./Connectable.js";
import { ToStringAndUUID } from "./ToStringAndUUID.js";


export abstract class BaseConnectable extends ToStringAndUUID implements Connectable {
  abstract connect<T extends Component>(destination: T): T;
  abstract connect<T extends CanBeConnectedTo>(destination: T): Component;

  getDestinationInfo(destination: CanBeConnectedTo): { component: Component, input: AbstractInput} {
    if (destination instanceof Function) {
      destination = new this._.FunctionComponent(destination)
    }
    let component: Component,
      input: AbstractInput;
    if ((destination instanceof AudioNode)
      || (destination instanceof AudioParam)) {
      component = new this._.AudioComponent(destination)
      input = component.getDefaultInput()
    } else if (destination instanceof AbstractInput) {
      component = destination.parent
      input = destination
    } else if (isComponent(destination)) {
      component = destination
      input = destination.getDefaultInput()
    } else {
      throw new Error("Improper input type for connect(). " + destination)
    }
    if (destination instanceof TypedConfigurable && destination.configId != this.configId) {
      throw new Error(`Unable to connect components from different namespaces. Given ${this} (config ID: ${this.configId}) and ${destination} (config ID: ${destination.configId})`)
    }
    return { component, input }
  }
}