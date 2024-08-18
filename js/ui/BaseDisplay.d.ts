import { VisualComponent } from "../components/base/VisualComponent.js";
import { ControlInput } from "../io/input/ControlInput.js";
export declare abstract class BaseDisplay<T extends VisualComponent = any> {
    component: T;
    constructor(component: T);
    assertInitialized(): void;
    abstract _display($root: JQuery, width: number, height: number): void;
    _refreshDisplay<T>(input: ControlInput<T>, newValue: T): void;
}
