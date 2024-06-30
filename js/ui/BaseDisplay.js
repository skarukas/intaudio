// TODO: Fix all the displays to work with BaseDisplay.
export class BaseDisplay {
    constructor(component) {
        this.component = component;
    }
    assertInitialized() {
        if (typeof $ == 'undefined') {
            throw new Error("JQuery is required to display UI components.");
        }
    }
    _refreshDisplay(input, newValue) {
        throw new Error("Not implemented!");
    }
}
