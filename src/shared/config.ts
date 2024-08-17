// @ts-ignore
import stache from 'stache-config';
import CallableInstance from "callable-instance";
import public_namespace from '../public.js'
import { SignalLogger } from './logger.js';

export abstract class TypedConfigurable extends CallableInstance<any, any> implements stache.Configurable {
  constructor() {
    super("__call__")
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
      writable: true,
      configurable: true
    })
    Object.defineProperty(this, 'length', {
      value: this.constructor.length,
      writable: true,
      configurable: true
    })
  }
  static config: AudioConfig
  static _: typeof public_namespace
  static configId: string
  // @ts-ignore
  config: AudioConfig
  // @ts-ignore
  _: typeof public_namespace
  // @ts-ignore
  configId: string
  __call__(__forbiddenCall: any) {
    throw new Error(`Object of type ${this.constructor.name} is not a function.`)
  }
}

export type AudioConfig = {
  audioContext: AudioContext,
  state: {
    isInitialized: boolean,
    workletIsAvailable: boolean
  },
  logger: SignalLogger,
  defaultSamplePeriodMs: number,
  useWorkletByDefault: boolean,
  workletPath: string
}