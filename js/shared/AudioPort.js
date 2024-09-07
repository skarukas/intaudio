var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
import { lazyProperty } from "./decorators.js";
import { getNumInputChannels, getNumOutputChannels } from "./multichannel.js";
class ConnectOperation {
    constructor(source, destination, fromIndex, toIndex) {
        this.source = source;
        this.destination = destination;
        this.fromIndex = fromIndex;
        this.toIndex = toIndex;
    }
    execute() {
        if (this.destination instanceof AudioNode) {
            this.source.connect(this.destination, this.fromIndex, this.toIndex);
        }
        else {
            this.source.connect(this.destination, this.fromIndex);
        }
    }
    undo() {
        ConnectOperation.simpleDisconnect(this.source, this.destination, this.fromIndex, this.toIndex);
    }
    static simpleConnect(sourceNode, destinationNode, outputIndex, inputIndex) {
        const connection = new ConnectOperation(sourceNode, destinationNode, outputIndex, inputIndex);
        connection.execute();
        return connection;
    }
    static simpleDisconnect(sourceNode, destinationNode, outputIndex, inputIndex) {
        if (destinationNode instanceof AudioNode) {
            sourceNode.disconnect(destinationNode, outputIndex, inputIndex);
        }
        else {
            sourceNode.disconnect(destinationNode, outputIndex);
        }
    }
}
export class BaseAudioPort extends ToStringAndUUID {
}
export class NodeOutputPort extends BaseAudioPort {
    constructor(node, outputIndex) {
        super();
        this.node = node;
        this.outputIndex = outputIndex;
        // Map from [inputPort, fromChannel, toChannel] -> Connection
        this.executedConnections = new Map();
        this.numChannels = getNumOutputChannels(this.node);
    }
    getConnection(destination, fromChannel, toChannel) {
        var _a, _b;
        return (_b = (_a = this.executedConnections.get(destination)) === null || _a === void 0 ? void 0 : _a[fromChannel]) === null || _b === void 0 ? void 0 : _b[toChannel];
    }
    setConnection(destination, fromChannel, toChannel, connection) {
        var _a, _b;
        const fromChannelObj = (_a = this.executedConnections.get(destination)) !== null && _a !== void 0 ? _a : {};
        const toChannelObj = (_b = fromChannelObj[fromChannel]) !== null && _b !== void 0 ? _b : {};
        toChannelObj[toChannel] = connection;
        fromChannelObj[fromChannel] = toChannelObj;
        this.executedConnections.set(destination, fromChannelObj);
    }
    connect(destination, fromChannel, toChannel) {
        const sourceNode = fromChannel == undefined ? this.node : this.splitter;
        const destinationNode = toChannel == undefined ? destination.node : destination.merger;
        const connection = ConnectOperation.simpleConnect(sourceNode, destinationNode, fromChannel, toChannel);
        this.setConnection(destination, fromChannel !== null && fromChannel !== void 0 ? fromChannel : -1, toChannel !== null && toChannel !== void 0 ? toChannel : -1, connection);
    }
    disconnect(destination, fromChannel, toChannel) {
        if (destination == undefined) {
            ConnectOperation.simpleDisconnect(this.node);
        }
        else {
            // TODO: disconnect all channel-specific connections when fromChannel / 
            // toChannel is undefined.
            const connection = this.getConnection(destination, fromChannel !== null && fromChannel !== void 0 ? fromChannel : -1, toChannel !== null && toChannel !== void 0 ? toChannel : -1);
            connection === null || connection === void 0 ? void 0 : connection.undo();
        }
    }
}
__decorate([
    lazyProperty((ths) => {
        const splitter = ths.audioContext.createChannelSplitter(ths.numChannels);
        ConnectOperation.simpleConnect(ths.node, splitter);
        return splitter;
    })
], NodeOutputPort.prototype, "splitter", void 0);
export class NodeInputPort extends BaseAudioPort {
    constructor(node, inputIndex) {
        super();
        this.node = node;
        this.inputIndex = inputIndex;
        this.numChannels = getNumInputChannels(this.node);
    }
}
__decorate([
    lazyProperty((ths) => {
        const merger = ths.audioContext.createChannelMerger(ths.numChannels);
        ConnectOperation.simpleConnect(merger, ths.node);
        return merger;
    })
], NodeInputPort.prototype, "merger", void 0);
