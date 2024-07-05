

import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import constants from "../shared/constants.js";
import { BaseComponent } from "./base/BaseComponent.js";

declare var $: JQueryStatic;

type MaybeJQuery<T> = JQuery<T> | T

export class MediaElementComponent extends BaseComponent {
  readonly start: ControlInput<typeof constants.TRIGGER>
  readonly stop: ControlInput<typeof constants.TRIGGER>
  readonly volume: ControlInput<number>
  readonly playbackRate: ControlInput<number>
  readonly audioOutput: AudioRateOutput

  mediaElement: HTMLMediaElement
  audioNode: MediaElementAudioSourceNode

  constructor(selectorOrElement: string | MaybeJQuery<HTMLMediaElement>, 
    { 
      preservePitchOnStretch = false
    }: { preservePitchOnStretch?: boolean } = {}
) {
    super()

    this.mediaElement = $(<any>selectorOrElement).get(0)
    this.audioNode = this.audioContext.createMediaElementSource(this.mediaElement)
    this.mediaElement.disableRemotePlayback = false;
    this.mediaElement.preservesPitch = preservePitchOnStretch;

    this.start = this.defineControlInput('start')
    this.stop = this.defineControlInput('stop')
    this.playbackRate = this.defineControlInput('playbackRate')
    this.volume = this.defineControlInput('volume')

    this.audioOutput = this.defineAudioOutput('audioOutput', this.audioNode)
  }
  inputDidUpdate(input: any, newValue: any): void {
    if (input == this.start) {
      this.mediaElement.pause()
    } else if (input == this.stop) {
      this.mediaElement.play()
    } else if (input == this.playbackRate) {
      this.mediaElement.playbackRate = Math.max(constants.MIN_PLAYBACK_RATE, Math.min(newValue, constants.MAX_PLAYBACK_RATE))
    } else if (input == this.volume) {
      this.mediaElement.volume = newValue
    }
  }
}