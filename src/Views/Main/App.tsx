import { Modal } from 'antd';
import axios from 'axios';
import { globalMessage } from 'Components/GlobalMessage/GlobalMessage';
import Settings from 'Components/Settings/Settings';
import Umamusume from 'Components/Umamusume/Umamusume';
import UpdateBubbles from 'Components/UpdateBubble/UpdateBubbles';
import React, { createContext, useEffect, useReducer, useState } from 'react';
import { needUpdate } from 'Utils/Global';
import { UmasMapActionTypes, UmasMapPayload } from 'Utils/Types';
import './App.scss';

const defaultUmas = (() => {
    const umaMap = new Map<string, UmasMapPayload>();
    const umasJson = require('./umas.json')
    for (const uma in umasJson) {
        if (Object.prototype.hasOwnProperty.call(umasJson, uma)) {
            umaMap.set(uma, umasJson[uma])
        }
    }
    return umaMap
})()

export const UmasMapContext = createContext<[Map<string, UmasMapPayload>, React.DispatchWithoutAction | null]>([defaultUmas, null])

export default function App() {
    const [appVersion, setAppVersion] = useState('');
    const [latestVersion, setLatestVersion] = useState('');
    useEffect(() => {
        (window as any).ipc.invoke('APP_VERSION').then((version: string) => {
            setAppVersion(version);
        });
    }, []);

    const [showSettings, setShowSettings] = useState(false)

    const [updating, setUpdating] = useState(false);

    const [umasMap, dispatchUmasMap] = useReducer<any>((state: Map<string, UmasMapPayload>, action: { type: UmasMapActionTypes, payload: UmasMapPayload }) => {
        switch (action.type) {
            case UmasMapActionTypes.ADD_INTO_UMA_MUSUMES_LIST:
                return new Map(state.set(action.payload.key, action.payload));
            case UmasMapActionTypes.REMOVE_FROM_UMA_MUSUMES_LIST:
                state.delete(action.payload.key);
                return new Map(state)
            default: return state
        }
    }, defaultUmas)

    return (
        <>
            <UmasMapContext.Provider value={[umasMap as Map<string, UmasMapPayload>, dispatchUmasMap]}>
                <Umamusume
                    checkForUpdate={() => {
                        axios
                            .get('https://assets.aiolia.top/ElectronApps/DerbyPet/manifest.json', {
                                headers: {
                                    'Cache-Control': 'no-cache',
                                },
                            })
                            .then((res) => {
                                const { latest } = res.data;
                                if (needUpdate(appVersion, latest)) setLatestVersion(latest);
                                else globalMessage.success({ content: '当前已是最新版本，无需更新' });
                            });
                    }}
                    settingVisible={showSettings}
                    showSetting={() => { setShowSettings(true) }}
                />

                <Settings
                    visible={showSettings}
                    closeFunc={() => {
                        setShowSettings(false)
                    }}
                />

                <UpdateBubbles visible={updating} targetVersion={latestVersion} />

                <Modal
                    visible={latestVersion !== ''}
                    centered
                    title='检测到新版本'
                    cancelText='取消'
                    okText='更新'
                    onCancel={() => {
                        setLatestVersion('');
                    }}
                    onOk={() => {
                        setUpdating(true);
                        setLatestVersion('');
                    }}>
                    检测到存在新版本 V {latestVersion} ，是否下载更新？
                </Modal>
            </UmasMapContext.Provider>
        </>
    );
}
