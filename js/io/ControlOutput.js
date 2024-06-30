export class ControlOutput extends AbstractOutput {
    connect(destination) {
        let { component } = this.getDestinationInfo(destination);
        this.connections.push(destination);
        return component;
    }
    setValue(value) {
        for (let c of this.connections) {
            c.setValue(value);
        }
        for (const callback of this.callbacks) {
            callback(value);
        }
    }
    onUpdate(callback) {
        this.callbacks.push(callback);
    }
}
