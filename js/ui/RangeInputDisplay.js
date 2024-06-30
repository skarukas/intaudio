var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SliderDisplay_instances, _SliderDisplay_getInputAttrs;
import { BaseDisplay } from "./BaseDisplay.js";
export class RangeInputDisplay extends BaseDisplay {
    updateValue(value) { }
    updateMinValue(value) { }
    updateMaxValue(value) { }
    updateStep(value) { }
}
export class KnobDisplay extends RangeInputDisplay {
    _display($root, width, height) {
        throw new Error("Not implemented!");
    }
}
export class SliderDisplay extends RangeInputDisplay {
    constructor() {
        super(...arguments);
        _SliderDisplay_instances.add(this);
    }
    _display($root, width, height) {
        this.$range = $(document.createElement('input'))
            .attr(__classPrivateFieldGet(this, _SliderDisplay_instances, "m", _SliderDisplay_getInputAttrs).call(this))
            .on('input', event => {
            this.component.output.setValue(Number(event.target.value));
        }).css({
            width: width,
            height: height,
        });
        $root.append(this.$range);
    }
    updateValue(value) {
        var _a;
        (_a = this.$range) === null || _a === void 0 ? void 0 : _a.prop('value', value);
    }
    updateMinValue(value) {
        var _a;
        (_a = this.$range) === null || _a === void 0 ? void 0 : _a.prop('min', value);
    }
    updateMaxValue(value) {
        var _a;
        (_a = this.$range) === null || _a === void 0 ? void 0 : _a.prop('max', value);
    }
    updateStep(value) {
        var _a;
        (_a = this.$range) === null || _a === void 0 ? void 0 : _a.prop('step', value);
    }
}
_SliderDisplay_instances = new WeakSet(), _SliderDisplay_getInputAttrs = function _SliderDisplay_getInputAttrs() {
    return {
        type: 'range',
        min: this.component.minValue.value,
        max: this.component.maxValue.value,
        step: this.component.step.value || 'any',
        value: this.component.input.value,
    };
};
