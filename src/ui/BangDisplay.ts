import constants from '../shared/constants.js';
import { BaseDisplay } from './BaseDisplay.js';
declare var $: JQueryStatic;

export class BangDisplay extends BaseDisplay {
  static PRESS_DURATION_MS = 100
  protected $button: JQuery<HTMLButtonElement> | undefined

  _display($root: JQuery, width: number, height: number) {
    this.$button = $(document.createElement('button'))
      .on('click', () => {
        this.component.trigger()
      }).css({
        width: width,
        height: height,
      })
      .attr('type', 'button')
      .addClass(constants.BANG_CLASS)
      .appendTo($root)
  }
  showPressed(duration?: number) {
    this.$button?.addClass(constants.BANG_PRESSED_CLASS)
    if (duration) {
      setTimeout(this.showUnpressed.bind(this), duration)
    }
  }
  showUnpressed() {
    this.$button?.removeClass(constants.BANG_PRESSED_CLASS)
  }
}