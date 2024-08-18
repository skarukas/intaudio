import { BaseDisplay } from './BaseDisplay.js';
export declare class BangDisplay extends BaseDisplay {
    static PRESS_DURATION_MS: number;
    protected $button: JQuery<HTMLButtonElement> | undefined;
    _display($root: JQuery, width: number, height: number): void;
    showPressed(duration?: number): void;
    showUnpressed(): void;
}
