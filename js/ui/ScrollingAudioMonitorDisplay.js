var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ScrollingAudioMonitorDisplay_instances, _ScrollingAudioMonitorDisplay_valueToDisplayableText, _ScrollingAudioMonitorDisplay_displayWaveform;
import constants from "../shared/constants.js";
import { scaleRange } from "../shared/util.js";
import { BaseDisplay } from "./BaseDisplay.js";
export class ScrollingAudioMonitorDisplay extends BaseDisplay {
    constructor() {
        super(...arguments);
        _ScrollingAudioMonitorDisplay_instances.add(this);
    }
    _display($container, width, height) {
        let size = {
            width: width,
            height: height,
        };
        this.$canvas = $(document.createElement('canvas')).css(size).attr(size);
        this.$minValueDisplay = $(document.createElement('span'))
            .addClass(constants.MONITOR_VALUE_CLASS)
            .css("bottom", "5px");
        this.$maxValueDisplay = $(document.createElement('span'))
            .addClass(constants.MONITOR_VALUE_CLASS)
            .css("top", "5px");
        $container.append(this.$canvas, this.$minValueDisplay, this.$maxValueDisplay);
        this.$container = $container;
        this.updateWaveformDisplay();
    }
    updateWaveformDisplay() {
        var _a, _b;
        if (this.$container) {
            const { minValue, maxValue } = this.component.getCurrentValueRange();
            if (minValue != this.currMinValue) {
                (_a = this.$minValueDisplay) === null || _a === void 0 ? void 0 : _a.text(__classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_valueToDisplayableText).call(this, minValue));
                this.currMinValue = minValue;
            }
            if (maxValue != this.currMaxValue) {
                (_b = this.$maxValueDisplay) === null || _b === void 0 ? void 0 : _b.text(__classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_valueToDisplayableText).call(this, maxValue));
                this.currMaxValue = maxValue;
            }
            __classPrivateFieldGet(this, _ScrollingAudioMonitorDisplay_instances, "m", _ScrollingAudioMonitorDisplay_displayWaveform).call(this, minValue, maxValue);
        }
    }
    drawSingleWaveform(ctx, values, strokeStyle, toX, toY) {
        // Draw graph
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        for (let i = 0; i < values.length; i++) {
            if (this.component.hideZeroSignal.value) {
                if (values[i]) {
                    ctx.lineTo(toX(i), toY(values[i]));
                    ctx.stroke();
                }
                else {
                    ctx.beginPath();
                }
            }
            else {
                // undefined if out of the memory range.
                if (values[i] != undefined) {
                    ctx.lineTo(toX(i), toY(values[i]));
                    ctx.stroke();
                }
                else {
                    ctx.beginPath();
                }
            }
        }
    }
}
_ScrollingAudioMonitorDisplay_instances = new WeakSet(), _ScrollingAudioMonitorDisplay_valueToDisplayableText = function _ScrollingAudioMonitorDisplay_valueToDisplayableText(value) {
    if (value === "auto") {
        return "";
    }
    else {
        return value.toFixed(2);
    }
}, _ScrollingAudioMonitorDisplay_displayWaveform = function _ScrollingAudioMonitorDisplay_displayWaveform(minValue, maxValue) {
    var _a, _b;
    if (!this.$canvas) {
        throw new Error("$canvas must be defined.");
    }
    let maxX = Number(this.$canvas.attr('width'));
    let memory = this.component._memory;
    let memLength = memory[0].length;
    let entryWidth = maxX / memLength;
    let maxY = Number(this.$canvas.attr('height'));
    const canvas = this.$canvas[0];
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Unable to load 2d Canvas context.");
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let hasOutOfBoundsValues = false;
    const toX = (i) => i * entryWidth;
    const toY = (v) => {
        const coordValue = scaleRange(v, [minValue, maxValue], [maxY, 0]);
        const isOutOfBounds = !!(v && ((coordValue > maxY) || (coordValue < 0)));
        hasOutOfBoundsValues || (hasOutOfBoundsValues = isOutOfBounds);
        return coordValue;
    };
    // Draw 0 line
    const zeroY = toY(0);
    if (zeroY <= maxY) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.moveTo(0, zeroY);
        ctx.lineTo(maxX, zeroY);
        ctx.stroke();
    }
    for (let i = memory.length - 1; i >= 0; i--) {
        const whiteVal = Math.pow((i / memory.length), 0.5) * 255;
        this.drawSingleWaveform(ctx, memory[i], `rgb(${whiteVal}, ${whiteVal}, ${whiteVal})`, toX, toY);
    }
    // Warn user visually if the range of the signal is not captured.
    if (hasOutOfBoundsValues) {
        (_a = this.$container) === null || _a === void 0 ? void 0 : _a.addClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS);
    }
    else {
        (_b = this.$container) === null || _b === void 0 ? void 0 : _b.removeClass(constants.MONITOR_OUT_OF_BOUNDS_CLASS);
    }
};
