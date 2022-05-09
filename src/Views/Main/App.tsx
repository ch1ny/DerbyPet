import { Modal } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { globalMessage } from '../../Components/GlobalMessage/GlobalMessage';
import Umamusume from '../../Components/Umamusume/Umamusume';
import UpdateBubbles from '../../Components/UpdateBubble/UpdateBubbles';
import './App.scss';

function needUpdate(nowVersion: string, targetVersion: string) {
    const nowArr = nowVersion.split('.').map((i) => Number(i));
    const newArr = targetVersion.split('.').map((i) => Number(i));
    const lessLength = Math.min(nowArr.length, newArr.length);
    for (let i = 0; i < lessLength; i++) {
        if (nowArr[i] < newArr[i]) {
            return true;
        } else if (nowArr[i] > newArr[i]) {
            return false;
        }
    }
    if (nowArr.length < newArr.length) return true;
    return false;
}

export default function App() {
    const [appVersion, setAppVersion] = useState('');
    const [latestVersion, setLatestVersion] = useState('');
    useEffect(() => {
        (window as any).ipc.invoke('APP_VERSION').then((version: string) => {
            setAppVersion(version);
        });
    }, []);

    const [updating, setUpdating] = useState(false);

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