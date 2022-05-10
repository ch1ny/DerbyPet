import { combineReducers } from "@reduxjs/toolkit";
import { SET_NEED_OPACITY, SET_UMA_MUSUME, SET_UMA_OPACITY } from "./actions";

function setUmaMusume(state = '特别周', action: { type: string, umamusume: string }) {
    if (action.type === SET_UMA_MUSUME) return action.umamusume
    return state
}

function setNeedOpacity(state = localStorage.getItem('needOpacity') === 'true', action: { type: string, need: boolean }) {
    if (action.type === SET_NEED_OPACITY) {
        localStorage.setItem('needOpacity', String(action.need))
        return action.need
    }
    return state
}

function setUmaOpacity(state = (() => {
    const umaOpacity = localStorage.getItem('umaOpacity')
    return umaOpacity === null ? 1 : Number(umaOpacity)
})(), action: { type: string, opacity: number }) {
    if (action.type === SET_UMA_OPACITY) {
        localStorage.setItem('umaOpacity', String(action.opacity))
        return action.opacity
    }
    return state
}

const reducers = combineReducers({
    umaMusume: setUmaMusume,
    needOpacity: setNeedOpacity,
    umaOpacity: setUmaOpacity
})
export default reducers