import stache from 'stache-config';
import CallableInstance from "callable-instance";
import public_namespace from '../public.js';
import { SignalLogger } from './logger.js';
export declare abstract class TypedConfigurable extends CallableInstance<any, any> implements stache.Configurable {
    constructor();
    static config: AudioConfig;
    static _: typeof public_namespace;
    static configId: string;
    config: AudioConfig;
    _: typeof public_namespace;
    configId: string;
    __call__(__forbiddenCall: any): void;
}
export type AudioConfig = {
    audioContext: AudioContext;
    state: {
        isInitialized: boolean;
        workletIsAvailable: boolean;
    };
    logger: SignalLogger;
    defaultSamplePeriodMs: number;
    useWorkletByDefault: boolean;
    workletPath: string;
};
