import { combineReducers } from "@reduxjs/toolkit";
import { SET_UMA_MUSUME } from "./actions";

function setUmaMusume(state = '特别周', action: { type: string, umamusume: string }) {
    if (action.type === SET_UMA_MUSUME) return action.umamusume
    return state
}

const reducers = combineReducers({
    umaMusume: setUmaMusume
})
export default reducers