import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
import { ObjectOf, WebAudioConnectable } from "./types.js";
declare class ConnectOperation {
    source: AudioNode;
    destination: WebAudioConnectable;
    fromIndex?: number | undefined;
    toIndex?: number | undefined;
    constructor(source: AudioNode, destination: WebAudioConnectable, fromIndex?: number | undefined, toIndex?: number | undefined);
    execute(): void;
    undo(): void;
    static simpleConnect(sourceNode: AudioNode, destinationNode: WebAudioConnectable, outputIndex?: number, inputIndex?: number): ConnectOperation;
    static simpleDisconnect(sourceNode: AudioNode, destinationNode?: WebAudioConnectable, outputIndex?: number, inputIndex?: number): void;
}
export declare abstract class BaseAudioPort extends ToStringAndUUID {
}
export declare class NodeOutputPort extends BaseAudioPort {
    node: AudioNode;
    outputIndex?: number | undefined;
    protected executedConnections: Map<NodeInputPort, ObjectOf<ObjectOf<ConnectOperation>>>;
    numChannels: number;
    constructor(node: AudioNode, outputIndex?: number | undefined);
    splitter: ChannelSplitterNode;
    protected getConnection(destination: NodeInputPort, fromChannel: number, toChannel: number): ConnectOperation | undefined;
    protected setConnection(destination: NodeInputPort, fromChannel: number, toChannel: number, connection: ConnectOperation): void;
    connect(destination: NodeInputPort, fromChannel?: number, toChannel?: number): void;
    disconnect(destination?: NodeInputPort, fromChannel?: number, toChannel?: number): void;
}
export declare class NodeInputPort extends BaseAudioPort {
    node: WebAudioConnectable;
    inputIndex?: number | undefined;
    numChannels: number;
    constructor(node: WebAudioConnectable, inputIndex?: number | undefined);
    merger: ChannelMergerNode;
}
export {};
