import { BaseDisplay } from './BaseDisplay.js';
export class BangDisplay extends BaseDisplay {
    _display($root, width, height) {
        let $button = $(document.createElement('button'))
            .on('click', () => {
            this.component.trigger();
        }).css({
            width: width,
            height: height,
        })
            .attr('type', 'button');
        $root.append($button);
    }
}
