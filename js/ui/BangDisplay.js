import constants from '../shared/constants.js';
import { BaseDisplay } from './BaseDisplay.js';
export class BangDisplay extends BaseDisplay {
    _display($root, width, height) {
        this.$button = $(document.createElement('button'))
            .on('click', () => {
            this.component.trigger();
        }).css({
            width: width,
            height: height,
        })
            .attr('type', 'button')
            .addClass(constants.BANG_CLASS)
            .appendTo($root);
    }
    showPressed(duration) {
        var _a;
        (_a = this.$button) === null || _a === void 0 ? void 0 : _a.addClass(constants.BANG_PRESSED_CLASS);
        if (duration) {
            setTimeout(this.showUnpressed.bind(this), duration);
        }
    }
    showUnpressed() {
        var _a;
        (_a = this.$button) === null || _a === void 0 ? void 0 : _a.removeClass(constants.BANG_PRESSED_CLASS);
    }
}
BangDisplay.PRESS_DURATION_MS = 100;
