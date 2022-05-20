import { setNeedOpacity, setUmaMusume, setUmaOpacity, SET_NEED_OPACITY, SET_UMA_MUSUME, SET_UMA_OPACITY, updateUmasMap } from "./Store/actions";
import store from "./Store/store";
import { UmasMapActionTypes, UmasMapPayload } from "./Types";

function syncRedux(action: { type: string | UmasMapActionTypes, payload: any }) {
    let dispatcher
    switch (action.type) {
        case SET_UMA_MUSUME:
            dispatcher = setUmaMusume(action.payload, 0)
            break;
        case SET_NEED_OPACITY:
            dispatcher = setNeedOpacity(action.payload, 0)
            break;
        case SET_UMA_OPACITY:
            dispatcher = setUmaOpacity(action.payload, 0)
            break;
        default:
            dispatcher = updateUmasMap(action as { type: UmasMapActionTypes; payload: UmasMapPayload | Map<string, UmasMapPayload> }, 0)
            break;
    }
    store.dispatch(dispatcher)
}

export default syncRedux