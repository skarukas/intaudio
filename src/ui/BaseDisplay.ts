import { VisualComponent } from "../components/base/VisualComponent.js"
import { ControlInput } from "../io/input/ControlInput.js";
declare var $: JQueryStatic;

// TODO: Fix all the displays to work with BaseDisplay.
export abstract class BaseDisplay<T extends VisualComponent = any> {
  constructor(public component: T) { }
  assertInitialized() {
    if (typeof $ == 'undefined') {
      throw new Error("JQuery is required to display UI components.")
    }
  }
  abstract _display($root: JQuery, width: number, height: number);
  _refreshDisplay<T>(input: ControlInput<T>, newValue: T) {
    throw new Error("Not implemented!")
  }
}