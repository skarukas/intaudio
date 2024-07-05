import constants from "../shared/constants.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class MediaElementComponent extends BaseComponent {
    constructor(selectorOrElement, { preservePitchOnStretch = false } = {}) {
        super();
        this.mediaElement = $(selectorOrElement).get(0);
        this.audioNode = this.audioContext.createMediaElementSource(this.mediaElement);
        this.mediaElement.disableRemotePlayback = false;
        this.mediaElement.preservesPitch = preservePitchOnStretch;
        this.start = this.defineControlInput('start');
        this.stop = this.defineControlInput('stop');
        this.playbackRate = this.defineControlInput('playbackRate');
        this.volume = this.defineControlInput('volume');
        this.audioOutput = this.defineAudioOutput('audioOutput', this.audioNode);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.start) {
            this.mediaElement.pause();
        }
        else if (input == this.stop) {
            this.mediaElement.play();
        }
        else if (input == this.playbackRate) {
            this.mediaElement.playbackRate = Math.max(constants.MIN_PLAYBACK_RATE, Math.min(newValue, constants.MAX_PLAYBACK_RATE));
        }
        else if (input == this.volume) {
            this.mediaElement.volume = newValue;
        }
    }
}
