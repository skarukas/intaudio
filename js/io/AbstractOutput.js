export class AbstractOutput extends Connectable {
    constructor() {
        super(...arguments);
        this.connections = [];
        this.callbacks = [];
    }
}
