export declare function contextPipe(fromContext: AudioContext, toContext: AudioContext): {
    sink: AudioNode;
    source: AudioNode;
};
export declare function joinContexts(sourceContexts: AudioContext[], destinationContext: AudioContext): {
    sinks: AudioNode[];
    source: AudioNode;
};
