import stache from 'stache-config';
import * as internals from './internals.js'
import public_namespace from './public.js'
import * as init from './shared/init.js'
import * as topLevel from './topLevel.js'

const withConfig = stache.registerAndCreateFactoryFn(
  init.defaultConfig,
  public_namespace,
  { ...internals }
)

export default {
  ...public_namespace,
  ...topLevel,
  internals,
  audioContext: init.GLOBAL_AUDIO_CONTEXT,
  out: new internals.AudioRateInput('out', undefined, init.GLOBAL_AUDIO_CONTEXT.destination),
  run: init.run,
  withConfig
}