export declare class HighResolutionTimer {
    duration: number;
    callback: (timer: HighResolutionTimer) => void;
    private totalTicks;
    private timer;
    private startTime;
    private currentTime;
    private deltaTime;
    constructor(duration: number, callback: (timer: HighResolutionTimer) => void);
    run(): void;
    stop(): void;
}
