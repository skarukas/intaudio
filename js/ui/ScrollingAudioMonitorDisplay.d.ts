import { ScrollingAudioMonitor } from "../components/ScrollingAudioMonitor.js";
import { BaseDisplay } from "./BaseDisplay.js";
export declare class ScrollingAudioMonitorDisplay extends BaseDisplay<ScrollingAudioMonitor> {
    #private;
    private $canvas?;
    private $maxValueDisplay?;
    private $minValueDisplay?;
    private $container?;
    private currMaxValue?;
    private currMinValue?;
    _display($container: JQuery<HTMLDivElement>, width: number, height: number): void;
    updateWaveformDisplay(): void;
    drawSingleWaveform(ctx: CanvasRenderingContext2D, values: number[], strokeStyle: string, toX: (v: number) => number, toY: (v: number) => number): void;
}
