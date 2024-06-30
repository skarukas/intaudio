import { ScrollingAudioMonitor } from "../components/ScrollingAudioMonitor.js";
import constants from "../shared/constants.js"
import { scaleRange } from "../shared/util.js";
import { BaseDisplay } from "./BaseDisplay.js"
declare var $: JQueryStatic;

export class ScrollingAudioMonitorDisplay extends BaseDisplay<ScrollingAudioMonitor> {
  private $canvas: JQuery<HTMLCanvasElement>
  private $maxValueDisplay: JQuery<HTMLSpanElement>
  private $minValueDisplay: JQuery<HTMLSpanElement>
  private $container: JQuery<HTMLDivElement>

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
      this.$minValueDisplay.text(this.#valueToDisplayableText(minValue))
      this.$maxValueDisplay.text(this.#valueToDisplayableText(maxValue))
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
  #displayWaveform(minValue, maxValue) {
    let maxX = Number(this.$canvas.attr('width'))
    let memory = this.component._memory
    let entryWidth = maxX / memory.length
    let maxY = Number(this.$canvas.attr('height'))
    const canvas = this.$canvas[0]

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let hasOutOfBoundsValues = false
    const toX = (i: number): number => i * entryWidth
    const toY = (v: number): number => {
      const coordValue = scaleRange(v, [minValue, maxValue], [maxY, 0])
      hasOutOfBoundsValues = hasOutOfBoundsValues
        || v && ((coordValue > maxY) || (coordValue < 0))
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

    // Draw graph
    ctx.beginPath();
    ctx.strokeStyle = "black";
    for (let i = 0; i < memory.length; i++) {
      if (this.component.hideZeroSignal.value) {
        if (memory[i]) {
          ctx.lineTo(toX(i), toY(memory[i]));
          ctx.stroke();
        } else {
          ctx.beginPath();
        }
      } else {
        // undefined if out of the memory range.
        if (memory[i] != undefined) {
          ctx.lineTo(toX(i), toY(memory[i]));
          ctx.stroke();
        } else {
          ctx.beginPath();
        }
      }
    }

    // Warn user visually if the range of the signal is not captured.
    if (hasOutOfBoundsValues) {
      this.$container.addClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS)
    } else {
      this.$container.removeClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS)
    }
  }
}