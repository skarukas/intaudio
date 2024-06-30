export function createConstantSource(audioContext) {
    let src = audioContext.createConstantSource();
    src.offset.setValueAtTime(0, audioContext.currentTime);
    src.start();
    return src;
}
export function isComponent(x) {
    return !!x.isComponent;
}
export function mapLikeToObject(map) {
    const obj = {};
    map.forEach((v, k) => obj[k] = v);
    return obj;
}
