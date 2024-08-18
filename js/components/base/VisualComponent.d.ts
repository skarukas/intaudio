import { BypassEvent, MuteEvent } from "../../shared/events.js";
import { BaseDisplay } from "../../ui/BaseDisplay.js";
import { BaseComponent } from "./BaseComponent.js";
interface NeedsDisplay<T> {
    display: NonNullable<T>;
}
export declare abstract class VisualComponent<T extends BaseDisplay = any> extends BaseComponent implements NeedsDisplay<T> {
    #private;
    static defaultWidth?: number;
    static defaultHeight?: number;
    /**
     * The parent element that this and other IA components are children of.
     */
    $root: JQuery<HTMLDivElement> | undefined;
    /**
     * The direct parent container of the component, containing any component-independent elements.
     */
    $container: JQuery<HTMLDivElement> | undefined;
    abstract display: NonNullable<T>;
    $bypassIndicator: JQuery | undefined;
    /**
     * The unique DOM selector that only applies to this element.
     */
    uniqueDomSelector: string;
    constructor();
    static adjustSize($root: JQuery<HTMLDivElement>): void;
    static rotate($container: JQuery, rotateDeg: number): void;
    addToDom(iaRootElement: JQuery<HTMLDivElement>, { left, top, width, height, rotateDeg }?: {
        left?: number;
        top?: number;
        width?: number;
        height?: number;
        rotateDeg?: number;
    }): JQuery<HTMLDivElement>;
    refreshDom(): void;
    onMuteEvent(event: MuteEvent): void;
    onBypassEvent(event: BypassEvent): void;
}
export {};
