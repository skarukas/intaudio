import { RangeInputComponent } from "../components/RangeInputComponent.js";
import { BaseDisplay } from "./BaseDisplay.js";
declare var $: JQueryStatic;

export abstract class RangeInputDisplay extends BaseDisplay<RangeInputComponent> {
  updateValue(value: number) { }
  updateMinValue(value: number) { }
  updateMaxValue(value: number) { }
  updateStep(value: number) { }
}

export class KnobDisplay extends RangeInputDisplay {
  _display($root: JQuery, width: number, height: number) {
    throw new Error("Not implemented!")
  }
}

export class SliderDisplay extends RangeInputDisplay {
  private $range?: JQuery

  #getInputAttrs() {
    return {
      type: 'range',
      min: this.component.minValue.value,
      max: this.component.maxValue.value,
      step: this.component.step.value || 'any',
      value: this.component.input.value,
    }
  }
  _display($root: JQuery, width: number, height: number) {
    this.$range = $(document.createElement('input'))
      .attr(this.#getInputAttrs())
      .on('input', event => {
        this.component.output.setValue(Number(event.target.value))
      }).css({
        width: width,
        height: height,
      })
    $root.append(this.$range)
  }
  updateValue(value: number) {
    this.$range?.prop('value', value)
  }
  updateMinValue(value: number) {
    this.$range?.prop('min', value)
  }
  updateMaxValue(value: number) {
    this.$range?.prop('max', value)
  }
  updateStep(value: number) {
    this.$range?.prop('step', value)
  }
}