import { BaseComponent } from "./base/BaseComponent.js";
export class IgnoreDuplicates extends BaseComponent {
    constructor() {
        super();
        this.input = this._defineControlInput('input');
        this.output = this._defineControlOutput('output');
    }
    inputDidUpdate(input, newValue) {
        if (newValue != this.value) {
            this.output.setValue(newValue);
            this.value = newValue;
        }
    }
}
