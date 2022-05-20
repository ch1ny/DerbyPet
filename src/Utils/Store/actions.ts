import { UmasMapActionTypes, UmasMapPayload } from "Utils/Types"
import store from "./store"

export const SET_THE_OTHER_WINDOW_ID = 'SET_THE_OTHER_WINDOW_ID'
export function setTheOtherWindowId(id: number) {
    return { type: SET_THE_OTHER_WINDOW_ID, id }
}

export const SET_MODIFIED_LIST = 'SET_MODIFIED_LIST'
export function setModifiedList(modifiedList: { [key: string]: UmasMapPayload }, windowId = store.getState().theOtherWindowId) {
    if (windowId !== 0) {
        (window as any).ipc.sendTo(windowId, 'SYNC_REDUX',)
    }
    return { type: SET_MODIFIED_LIST, modifiedList }
}

export const SET_UMA_MUSUME = 'SET_UMA_MUSUME'
export function setUmaMusume(umamusume: string, windowId = store.getState().theOtherWindowId) {
    if (windowId !== 0) {
        (window as any).ipc.sendTo(windowId, 'SYNC_REDUX', {
            type: SET_UMA_MUSUME, payload: umamusume
        })
    }
    return { type: SET_UMA_MUSUME, umamusume }
}

export const SET_NEED_OPACITY = 'SET_NEED_OPACITY'
export function setNeedOpacity(need: boolean, windowId = store.getState().theOtherWindowId) {
    if (windowId !== 0) {
        (window as any).ipc.sendTo(windowId, 'SYNC_REDUX', {
            type: SET_NEED_OPACITY, payload: need
        })
    }
    return { type: SET_NEED_OPACITY, need }
}

export const SET_UMA_OPACITY = 'SET_UMA_OPACITY'
export function setUmaOpacity(opacity: number, windowId = store.getState().theOtherWindowId) {
    if (windowId !== 0) {
        (window as any).ipc.sendTo(windowId, 'SYNC_REDUX', {
            type: SET_UMA_OPACITY, payload: opacity
        })
    }
    return { type: SET_UMA_OPACITY, opacity }
}

export function updateUmasMap(action: { type: UmasMapActionTypes, payload: UmasMapPayload | Map<string, UmasMapPayload> }, windowId = store.getState().theOtherWindowId) {
    if (windowId !== 0) {
        (window as any).ipc.sendTo(windowId, 'SYNC_REDUX', action)
    }
    return action
}