import { Keyboard } from "../components/Keyboard.js";
import { KeyEvent } from "../shared/events.js";
import { BaseDisplay } from "./BaseDisplay.js";
export declare class KeyboardDisplay extends BaseDisplay<Keyboard> {
    $keys: {
        [k: number]: JQuery<HTMLButtonElement>;
    };
    _display($root: JQuery, width: number, height: number): void;
    showKeyEvent(event: KeyEvent): void;
}
