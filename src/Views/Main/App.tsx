import { Modal } from 'antd';
import axios from 'axios';
import { globalMessage } from 'Components/GlobalMessage/GlobalMessage';
import Umamusume from 'Components/Umamusume/Umamusume';
import UpdateBubbles from 'Components/UpdateBubble/UpdateBubbles';
import React, { useEffect, useState } from 'react';
import { needUpdate } from 'Utils/Global';
import { setModifiedList, setTheOtherWindowId, updateUmasMap } from 'Utils/Store/actions';
import store from 'Utils/Store/store';
import syncRedux from 'Utils/SyncRedux';
import { UmasMapActionTypes, UmasMapPayload } from 'Utils/Types';
import './App.scss';

export default function App() {
    const [appVersion, setAppVersion] = useState('');
    const [latestVersion, setLatestVersion] = useState('');
    useEffect(() => {
        (window as any).ipc.on('ASK_FOR_REDUX', (evt: Event, settingWindowId: number) => {
            store.dispatch(setTheOtherWindowId(settingWindowId));
            (window as any).ipc.sendTo(settingWindowId, 'INIT_SETTING_WINDOW_REDUX', store.getState());
        });
        (window as any).ipc.invoke('APP_VERSION').then((version: string) => {
            setAppVersion(version);
        });
        (window as any).ipc.on('SYNC_REDUX', (evt: Event, action: { type: string | UmasMapActionTypes, payload: any }) => {
            syncRedux(action);
        })
    }, []);

    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        (window as any).ipc.invoke('GET_MODIFIED_JSON').then((json: { [key: string]: UmasMapPayload }) => {
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    store.dispatch(updateUmasMap({ type: UmasMapActionTypes.ADD_INTO_UMA_MUSUMES_LIST, payload: json[`${key}`] }))
                }
            }
            store.dispatch(setModifiedList(json))
        })
    }, [])

    return (
        <>
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
        </>
    );
}
