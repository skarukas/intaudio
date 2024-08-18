import { SupportsSelect } from "../components/MidiInputDevice.js";
import { VisualComponent } from "../components/base/VisualComponent.js";
import { BaseDisplay } from "./BaseDisplay.js";
export declare class SelectDisplay<T extends SupportsSelect & VisualComponent> extends BaseDisplay<T> {
    $select: JQuery<HTMLSelectElement> | undefined;
    _display($root: JQuery<HTMLDivElement>): void;
    private populateOptions;
    refresh(): void;
}
