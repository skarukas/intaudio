import { BaseDisplay } from './BaseDisplay.js';
declare var $: JQueryStatic;

export class BangDisplay extends BaseDisplay {
  _display($root: JQuery, width: number, height: number) {
    let $button = $(document.createElement('button'))
      .on('click', () => {
        this.component.trigger()
      }).css({
        width: width,
        height: height,
      })
      .attr('type', 'button')
    $root.append($button)
  }
  // TODO: show when it receives an external trigger.
}