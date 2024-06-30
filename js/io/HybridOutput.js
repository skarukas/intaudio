export class HybridOutput extends AudioRateOutput {
    connect(destination) {
        let { input } = this.getDestinationInfo(destination);
        if (input instanceof AudioRateInput) {
            return AudioRateOutput.prototype.connect.bind(this)(destination);
        }
        else if (input instanceof ControlInput) {
            return ControlOutput.prototype.connect.bind(this)(destination);
        }
        else {
            throw new Error("Unable to connect to " + destination);
        }
    }
    setValue(value) {
        for (let c of this.connections) {
            c.setValue(value);
        }
    }
}
