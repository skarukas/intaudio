import { Component } from "../../components/base/Component.js";
import { CanBeConnectedTo } from "../types.js";

export interface Connectable {
  connect<T extends CanBeConnectedTo>(destination: T): Component;
}