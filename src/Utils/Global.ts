export const needUpdate = (nowVersion: string, targetVersion: string): boolean => {
    const nowArr = nowVersion.split('.').map((i) => Number(i));
    const newArr = targetVersion.split('.').map((i) => Number(i));
    const lessLength = Math.min(nowArr.length, newArr.length);
    for (let i = 0; i < lessLength; i++) {
        if (nowArr[i] < newArr[i]) {
            return true;
        } else if (nowArr[i] > newArr[i]) {
            return false;
        }
    }
    if (nowArr.length < newArr.length) return true;
    return false;
}

/**
 * 封装的节流函数
 * @param func 被封装的函数
 * @param time 节流间隔
 * @returns 封装后的节流函数，回收垃圾函数
 */
export const throttle = function (func: Function, time: number)
    : [
        (this: Object, ...args: any[]) => any,
        () => any
    ] {
    let timeout: NodeJS.Timeout | null;
    return [function (this: Object, ...args: any[]) {
        if (!timeout) {
            func.apply(this, args);
            timeout = setTimeout(() => {
                timeout = null;
            }, time);
        }
    }, function () {
        if (timeout) clearTimeout(timeout)
        timeout = null
    }]
}