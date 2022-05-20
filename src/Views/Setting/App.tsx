import { CloseOutlined } from "@ant-design/icons";
import Settings from "Components/Settings/Settings";
import React, { useEffect } from "react";
import { setModifiedList, setNeedOpacity, setTheOtherWindowId, setUmaMusume, setUmaOpacity, updateUmasMap } from "Utils/Store/actions";
import store from "Utils/Store/store";
import syncRedux from "Utils/SyncRedux";
import { UmasMapActionTypes, UmasMapPayload } from "Utils/Types";
import './App.scss';

const defaultUmas = (() => {
    const umaMap = new Map<string, UmasMapPayload>();
    const umasJson = require('../umas.json')
    for (const uma in umasJson) {
        if (Object.prototype.hasOwnProperty.call(umasJson, uma)) {
            umaMap.set(uma, umasJson[uma])
        }
    }
    return umaMap
})()

const closeSettingWindow = () => {
    (window as any).ipc.send('CLOSE_SETTING_WINDOW')
}

interface NeededReduxStatuses {
    modifiedList: { [key: string]: UmasMapPayload },
    umaMusume: string,
    needOpacity: boolean,
    umaOpacity: number,
    umasMap: Map<string, UmasMapPayload>
}

export default function App() {
    useEffect(() => {
        (window as any).ipc.once('INIT_SETTING_WINDOW_REDUX', (evt: Event, redux: NeededReduxStatuses) => {
            const { modifiedList, umaMusume, needOpacity, umaOpacity, umasMap } = redux
            store.dispatch(setModifiedList(modifiedList));
            store.dispatch(setUmaMusume(umaMusume));
            store.dispatch(setNeedOpacity(needOpacity));
            store.dispatch(setUmaOpacity(umaOpacity));
            store.dispatch(updateUmasMap({ type: UmasMapActionTypes.INIT_UMA_MUSUMES_LIST, payload: umasMap }));
        });
        (window as any).ipc.send('ASK_PET_WINDOW_FOR_REDUX');
        (window as any).ipc.invoke('GET_PET_WINDOW_ID').then((id: number) => {
            store.dispatch(setTheOtherWindowId(id))
        });
        (window as any).ipc.on('SYNC_REDUX', (evt: Event, action: { type: string | UmasMapActionTypes, payload: any }) => {
            syncRedux(action)
        })
    }, [])

    return (
        <>
            <div className="dragbar">
                <div className="dragbarButtons" onClick={closeSettingWindow}>
                    <CloseOutlined />
                </div>
            </div>
            <div className="content">
                <Settings />
            </div>
        </>
    )
}