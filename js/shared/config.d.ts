import CallableInstance from "callable-instance";
import stache from 'stache-config';
import public_namespace from '../public.js';
import { Connectable } from './base/Connectable.js';
import { SignalLogger } from './logger.js';
import { ObjectOf } from './types.js';
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
        workletIsAvailable: boolean;
        components: ObjectOf<WeakRef<Connectable>>;
    };
    logger: SignalLogger;
    defaultSamplePeriodMs: number;
    useWorkletByDefault: boolean;
    workletPath: string;
};
