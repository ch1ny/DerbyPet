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