import { combineReducers } from "@reduxjs/toolkit";
import { UmasMapActionTypes, UmasMapPayload } from "Utils/Types";
import { SET_MODIFIED_LIST, SET_NEED_OPACITY, SET_THE_OTHER_WINDOW_ID, SET_UMA_MUSUME, SET_UMA_OPACITY } from "./actions";

const initialStates = {
    needOpacity: (() => {
        return localStorage.getItem('needOpacity') === 'true'
    })(),
    umaOpacity: (() => {
        const umaOpacity = localStorage.getItem('umaOpacity')
        return umaOpacity === null ? 1 : Number(umaOpacity)
    })(),
    defaultUmas: (() => {
        const umaMap = new Map<string, UmasMapPayload>();
        const umasJson = require('Views/umas.json')
        for (const uma in umasJson) {
            if (Object.prototype.hasOwnProperty.call(umasJson, uma)) {
                umaMap.set(uma, umasJson[uma])
            }
        }
        return umaMap
    })()
}

function setTheOtherWindowId(state = 0, action: { type: string, id: number }) {
    if (action.type === SET_THE_OTHER_WINDOW_ID) return action.id
    return state
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

function updateUmasMap(state = initialStates.defaultUmas, action: { type: UmasMapActionTypes, payload: UmasMapPayload | Map<string, UmasMapPayload> })
    : Map<string, UmasMapPayload> {
    switch (action.type) {
        case UmasMapActionTypes.ADD_INTO_UMA_MUSUMES_LIST:
            const payload = action.payload as UmasMapPayload
            return new Map(state.set(payload.key, payload));
        case UmasMapActionTypes.REMOVE_FROM_UMA_MUSUMES_LIST:
            state.delete((action.payload as UmasMapPayload).key);
            return new Map(state)
        case UmasMapActionTypes.INIT_UMA_MUSUMES_LIST:
            return (action.payload as Map<string, UmasMapPayload>)
        default: return state
    }
}

const reducers = combineReducers({
    theOtherWindowId: setTheOtherWindowId,
    modifiedList: setModifiedList,
    umaMusume: setUmaMusume,
    needOpacity: setNeedOpacity,
    umaOpacity: setUmaOpacity,
    umasMap: updateUmasMap
})
export default reducers