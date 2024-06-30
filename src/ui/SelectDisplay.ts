import { SupportsSelect } from "../components/MidiInputDevice.js";
import { VisualComponent } from "../components/base/VisualComponent.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { BaseDisplay } from "./BaseDisplay.js";

export class SelectDisplay< T extends SupportsSelect & VisualComponent> extends BaseDisplay<T> {
  $select: JQuery<HTMLSelectElement>

  _display($root: JQuery<HTMLDivElement>) {
    // Create dropdown
    this.$select = $(document.createElement('select'))
      .appendTo($root)
      .on('change', e => {
        this.component.setOption(e.currentTarget.value)
      })
    this.populateOptions()
  }
  private populateOptions() {
    this.$select.empty()
    for (const { id, name: value } of this.component.selectOptions) {
      const $option = $(document.createElement('option'))
        .prop('value', id)
        .text(value)
      this.$select.append($option)
    }
    const id = this.component.selectedId
    this.$select.find(`option[value="${id}"`).prop('selected', true);
  }
  refresh() {
    this.populateOptions()
  }
}