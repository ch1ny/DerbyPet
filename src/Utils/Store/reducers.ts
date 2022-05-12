import { combineReducers } from "@reduxjs/toolkit";
import { UmasMapPayload } from "Utils/Types";
import { SET_MODIFIED_LIST, SET_NEED_OPACITY, SET_UMA_MUSUME, SET_UMA_OPACITY } from "./actions";

const initialStates = {
    needOpacity: (() => {
        return localStorage.getItem('needOpacity') === 'true'
    })(),
    umaOpacity: (() => {
        const umaOpacity = localStorage.getItem('umaOpacity')
        return umaOpacity === null ? 1 : Number(umaOpacity)
    })()
}

function setModifiedList(state = {}, action: { type: string, modifiedList: { [key: string]: UmasMapPayload } }) {
    if (action.type === SET_MODIFIED_LIST) {
        return action.modifiedList
    }
    return state
}

function setUmaMusume(state = '特别周', action: { type: string, umamusume: string }) {
    if (action.type === SET_UMA_MUSUME) return action.umamusume
    return state
}

function setNeedOpacity(state = initialStates.needOpacity, action: { type: string, need: boolean }) {
    if (action.type === SET_NEED_OPACITY) {
        localStorage.setItem('needOpacity', String(action.need))
        return action.need
    }
    return state
}

function setUmaOpacity(state = initialStates.umaOpacity, action: { type: string, opacity: number }) {
    if (action.type === SET_UMA_OPACITY) {
        localStorage.setItem('umaOpacity', String(action.opacity))
        return action.opacity
    }
    return state
}

const reducers = combineReducers({
    modifiedList: setModifiedList,
    umaMusume: setUmaMusume,
    needOpacity: setNeedOpacity,
    umaOpacity: setUmaOpacity
})
export default reducers