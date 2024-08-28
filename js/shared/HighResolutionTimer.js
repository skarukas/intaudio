// https://gist.github.com/jvlppm/b4fd92e4579d59d0a9ea5656b865e0d2
export class HighResolutionTimer {
    constructor(duration, callback) {
        this.duration = duration;
        this.callback = callback;
        this.totalTicks = 0;
        this.deltaTime = 0;
    }
    run() {
        let lastTime = this.currentTime;
        this.currentTime = Date.now();
        if (!this.startTime) {
            this.startTime = this.currentTime;
        }
        if (lastTime !== undefined) {
            this.deltaTime = (this.currentTime - lastTime);
        }
        this.callback(this);
        let nextTick = this.duration - (this.currentTime - (this.startTime + (this.totalTicks * this.duration)));
        this.totalTicks++;
        this.timer = setTimeout(() => {
            this.run();
        }, nextTick);
    }
    stop() {
        if (this.timer !== undefined) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
}
