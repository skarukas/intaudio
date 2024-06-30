import stache from 'stache-config';
import public_namespace from '../public.js'

export abstract class TypedConfigurable<T> extends stache.Configurable {
  config: T
  _: typeof public_namespace
  configId: string
  static config: any
  static _: typeof public_namespace
  static configId: string
}

export type AudioConfig = {
  audioContext: AudioContext,
  state: {
    isInitialized: boolean,
  }
  defaultSamplePeriodMs: number
}