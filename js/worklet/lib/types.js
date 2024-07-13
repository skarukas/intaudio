export function toMultiChannelArray(array) {
    const proxy = new Proxy(array, {
        get(target, p, receiver) {
            if (p == "left")
                return target[0];
            if (p == "right")
                return target[1];
            return target[p];
        }
    });
    return proxy;
}
