import { BaseDisplay } from "./BaseDisplay.js";
export class SelectDisplay extends BaseDisplay {
    _display($root) {
        // Create dropdown
        this.$select = $(document.createElement('select'))
            .appendTo($root)
            .on('change', e => {
            this.component.setOption(e.currentTarget.value);
        });
        this.populateOptions();
    }
    populateOptions() {
        if (this.$select == undefined)
            return;
        this.$select.empty();
        for (const { id, name: value } of this.component.selectOptions) {
            const $option = $(document.createElement('option'))
                .prop('value', id)
                .text(value);
            this.$select.append($option);
        }
        const id = this.component.selectedId;
        this.$select.find(`option[value="${id}"`).prop('selected', true);
    }
    refresh() {
        this.populateOptions();
    }
}
