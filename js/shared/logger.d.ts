import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
type NodeInfo = {
    analyzers: AnalyserNode[];
    formatString: string;
};
export declare class SignalLogger extends ToStringAndUUID {
    samplePeriodMs: number;
    analysers: NodeInfo[];
    protected interval: number | undefined;
    constructor(samplePeriodMs?: number);
    start(): void;
    stop(): void;
    /**
     * Register a node to be monitored.
     */
    register(output: AudioRateOutput, formatString: string): void;
}
export {};
