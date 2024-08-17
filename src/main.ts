// @ts-ignore Missing d.ts
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

// TODO: This is more of a hack. Make it so every entry of ia is available on 
// the configured version and correctly bound.
const boundTopLevel: any = {}
for (const prop in topLevel) {
  boundTopLevel[prop] = (<any>topLevel)[prop].bind({
    config: init.defaultConfig,
    _: internals
  })
}

export default {
  ...public_namespace,
  ...boundTopLevel,
  internals,
  audioContext: init.GLOBAL_AUDIO_CONTEXT,
  config: init.defaultConfig,
  out: new internals.AudioRateInput('out', undefined, init.GLOBAL_AUDIO_CONTEXT.destination),
  run: init.run,
  withConfig
}