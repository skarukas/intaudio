import stache from 'stache-config';
import public_namespace from '../public.js'

export abstract class TypedConfigurable extends stache.Configurable {
  static config: AudioConfig
  static _: typeof public_namespace
  static configId: string
  config: AudioConfig
  _: typeof public_namespace
  configId: string
}

export type AudioConfig = {
  audioContext: AudioContext,
  state: {
    isInitialized: boolean,
    workletIsAvailable: boolean
  }
  defaultSamplePeriodMs: number,
  workletPath: string
}