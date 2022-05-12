import { UmasMapPayload } from "Utils/Types"

export const SET_MODIFIED_LIST = 'SET_MODIFIED_LIST'
export function setModifiedList(modifiedList: { [key: string]: UmasMapPayload }) {
    return { type: SET_MODIFIED_LIST, modifiedList }
}

export const SET_UMA_MUSUME = 'SET_UMA_MUSUME'
export function setUmaMusume(umamusume: string) {
    return { type: SET_UMA_MUSUME, umamusume }
}

export const SET_NEED_OPACITY = 'SET_NEED_OPACITY'
export function setNeedOpacity(need: boolean) {
    return { type: SET_NEED_OPACITY, need }
}

export const SET_UMA_OPACITY = 'SET_UMA_OPACITY'
export function setUmaOpacity(opacity: number) {
    return { type: SET_UMA_OPACITY, opacity }
}