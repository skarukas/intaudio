import { ScrollingAudioMonitor } from "../components/ScrollingAudioMonitor.js";
import constants from "../shared/constants.js"
import { scaleRange } from "../shared/util.js";
import { BaseDisplay } from "./BaseDisplay.js"
declare var $: JQueryStatic;

export class ScrollingAudioMonitorDisplay extends BaseDisplay<ScrollingAudioMonitor> {
  private $canvas?: JQuery<HTMLCanvasElement>
  private $maxValueDisplay?: JQuery<HTMLSpanElement>
  private $minValueDisplay?: JQuery<HTMLSpanElement>
  private $container?: JQuery<HTMLDivElement>
  private currMaxValue?: number
  private currMinValue?: number

  _display($container: JQuery<HTMLDivElement>, width: number, height: number) {
    let size = {
      width: width,
      height: height,
    }
    this.$canvas = $(document.createElement('canvas')).css(size).attr(size)
    this.$minValueDisplay = $(document.createElement('span'))
      .addClass(constants.MONITOR_VALUE_CLASS)
      .css("bottom", "5px")
    this.$maxValueDisplay = $(document.createElement('span'))
      .addClass(constants.MONITOR_VALUE_CLASS)
      .css("top", "5px")
    $container.append(this.$canvas, this.$minValueDisplay, this.$maxValueDisplay)
    this.$container = $container
    this.updateWaveformDisplay()
  }
  updateWaveformDisplay() {
    if (this.$container) {
      const { minValue, maxValue } = this.component.getCurrentValueRange()
      if (minValue != this.currMinValue) {
        this.$minValueDisplay?.text(this.#valueToDisplayableText(minValue))
        this.currMinValue = minValue
      }
      if (maxValue != this.currMaxValue) {
        this.$maxValueDisplay?.text(this.#valueToDisplayableText(maxValue))
        this.currMaxValue = maxValue
      }
      this.#displayWaveform(minValue, maxValue)
    }
  }
  #valueToDisplayableText(value: number | 'auto'): string {
    if (value === "auto") {
      return ""
    } else {
      return value.toFixed(2)
    }
  }
  #displayWaveform(minValue: number, maxValue: number) {
    if (!this.$canvas) {
      throw new Error("$canvas must be defined.")
    }
    let maxX = Number(this.$canvas.attr('width'))
    let memory = this.component._memory
    let memLength = memory[0].length
    let entryWidth = maxX / memLength
    let maxY = Number(this.$canvas.attr('height'))
    const canvas = this.$canvas[0]

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Unable to load 2d Canvas context.")
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let hasOutOfBoundsValues = false
    const toX = (i: number): number => i * entryWidth
    const toY = (v: number): number => {
      const coordValue = scaleRange(v, [minValue, maxValue], [maxY, 0])
      const isOutOfBounds = !!(v && ((coordValue > maxY) || (coordValue < 0)))
      hasOutOfBoundsValues ||= isOutOfBounds
      return coordValue
    }
    // Draw 0 line
    const zeroY = toY(0)
    if (zeroY <= maxY) {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
      ctx.beginPath()
      ctx.moveTo(0, zeroY)
      ctx.lineTo(maxX, zeroY);
      ctx.stroke();
    }
    for (let i = memory.length - 1; i >= 0; i--) {
      const whiteVal = (i / memory.length) ** 0.5 * 255
      this.drawSingleWaveform(ctx, memory[i], `rgb(${whiteVal}, ${whiteVal}, ${whiteVal})`, toX, toY)
    }

    // Warn user visually if the range of the signal is not captured.
    if (hasOutOfBoundsValues) {
      this.$container?.addClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS)
    } else {
      this.$container?.removeClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS)
    }
  }
  drawSingleWaveform(
    ctx: CanvasRenderingContext2D,
    values: number[],
    strokeStyle: string,
    toX: (v: number) => number,
    toY: (v: number) => number
  ) {
    // Draw graph
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
      if (this.component.hideZeroSignal.value) {
        if (values[i]) {
          ctx.lineTo(toX(i), toY(values[i]));
          ctx.stroke();
        } else {
          ctx.beginPath();
        }
      } else {
        // undefined if out of the memory range.
        if (values[i] != undefined) {
          ctx.lineTo(toX(i), toY(values[i]));
          ctx.stroke();
        } else {
          ctx.beginPath();
        }
      }
    }
  }
}