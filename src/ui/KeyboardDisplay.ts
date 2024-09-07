
import { Keyboard } from "../components/Keyboard.js";
import constants from "../shared/constants.js";
import { KeyEvent, KeyEventType } from "../shared/events.js";
import { BaseDisplay } from "./BaseDisplay.js";
declare var $: JQueryStatic;

export class KeyboardDisplay extends BaseDisplay<Keyboard> {
  $keys: { [k: number]: JQuery<HTMLButtonElement> } = {}
  _display($root: JQuery, width: number, height: number) {
    // Obviously this is the wrong keyboard arrangement. TODO: that.
    let keyWidth = width / this.component.numKeys.value
    this.$keys = {}
    const lo = this.component.lowestPitch.value
    const hi = this.component.highestPitch
    for (let pitch = lo; pitch < hi; pitch++) {
      let $key = $(document.createElement('button'))
        .addClass(constants.KEYBOARD_KEY_CLASS)
        .css({
          width: keyWidth,
          height: height,
        })
        .attr('type', 'button')
        // Keydown handled locally
        .on(constants.EVENT_MOUSEDOWN, () => this.component.keyDown(pitch))
      this.$keys[pitch] = $key
      $root.append($key)
    }
    // Key releases are handled globally to prevent releasing when not on a 
    // button (doesn't trigger mouseup on the button).
    // TODO: isn't this inefficient to propogate 48 updates on one keydown...? 
    $root.on(constants.EVENT_MOUSEUP, () => {
      Object.keys(this.$keys).forEach(k => this.component.keyUp(+k))
    })
  }
  showKeyEvent(event: KeyEvent) {
    let $key = this.$keys[event.eventPitch]
    if ($key) {
      if (event.eventType == KeyEventType.KEY_DOWN) {
        $key.addClass(constants.KEYBOARD_KEY_PRESSED_CLASS)
      } else {
        $key.removeClass(constants.KEYBOARD_KEY_PRESSED_CLASS)
      }
    }
  }
}