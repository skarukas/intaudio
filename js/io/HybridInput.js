export class HybridInput extends AbstractInput {
    // Hybrid input can connect an audio input to a sink, but it also can
    // receive control inputs.
    constructor(parent, audioSink, defaultValue = _UNSET_VALUE, isRequired = false) {
        super(parent, isRequired);
        this.parent = parent;
        this.audioSink = audioSink;
        this.isRequired = isRequired;
        this._value = defaultValue;
    }
    get value() {
        return this._value;
    }
    setValue(value) {
        var _a;
        if (value == TRIGGER && this.value != undefined) {
            value = this.value;
        }
        this._value = value;
        this.audioSink["value"] = value;
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.propagateUpdatedInput(this, value);
    }
}
