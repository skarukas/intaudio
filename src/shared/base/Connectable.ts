import { CanBeConnectedTo } from "../types.js";

export interface Connectable {
  connect<T extends CanBeConnectedTo>(destination: T): Connectable;
}