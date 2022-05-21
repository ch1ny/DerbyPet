import { Button, Image, Progress } from "antd";
import axios from "axios";
import { globalMessage } from "Components/GlobalMessage/GlobalMessage";
import React, { useEffect, useState } from "react";
import { needUpdate } from "Utils/Global";

export default function About() {
    const [appVersion, setAppVersion] = useState('')
    useEffect(() => {
        (async () => {
            setAppVersion(await (window as any).ipc.invoke('APP_VERSION'));
        })();
    }, [])

    const thisYear = new Date().getFullYear()
    const [latestVersion, setLatestVersion] = useState('');
    const [checking, setChecking] = useState(false);
    const checkForUpdate = () => {
        setChecking(true);
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
            })
            .catch(() => {
                globalMessage.error({
                    content: '检查更新失败',
                });
            })
            .finally(() => {
                setChecking(false);
            });
    };

    const [total, setTotal] = useState(Infinity);
    const [loaded, setLoaded] = useState(0);
    const [updating, setUpdating] = useState(false);
    const update = () => {
        setUpdating(true);
        axios
            .get(`https://assets.aiolia.top/ElectronApps/DerbyPet/${latestVersion}/update.zip`, {
                responseType: 'blob',
                onDownloadProgress: (evt) => {
                    const { loaded, total } = evt;
                    setTotal(total);
                    setLoaded(loaded);
                },
                headers: {
                    'Cache-Control': 'no-cache',
                },
            })
            .then((res) => {
                const fr = new FileReader();
                fr.onload = () => {
                    (window as any).ipc.invoke('DOWNLOADED_UPDATE_ZIP', fr.result).then(() => {
                        setTimeout(() => {
                            (window as any).ipc.send('READY_TO_UPDATE');
                        }, 750);
                    });
                };
                fr.readAsBinaryString(res.data);
                globalMessage.success({ content: '更新包下载完毕，即将重启应用...' });
            });
    };

    return (
        <div style={{ textAlign: 'center', userSelect: 'none' }}>
            <Image
                src={'./electronAssets/favicon.ico'}
                preview={false}
                width={'200px'}
                height={'175px'}
            />
            <div style={{ margin: '0.5rem', fontSize: '1.5rem', color: '#3c3c3c' }}>
                V {appVersion}
            </div>
            {latestVersion ? (
                <>
                    <div>检查到有新的可用版本：V {latestVersion}，是否进行更新？</div>
                    {updating ? (
                        <>
                            <Progress
                                percent={Number(((loaded / total) * 100).toFixed(0))}
                                status={loaded === total ? 'success' : 'active'}
                            />
                        </>
                    ) : (
                        <Button onClick={update}>开始下载</Button>
                    )}
                </>
            ) : (
                <Button type='primary' size='small' onClick={checkForUpdate} loading={checking}>
                    检查更新
                </Button>
            )}
            <div style={{ margin: '1rem' }}>
                Copyright (c) 2021{thisYear ? ` - ${thisYear}` : ''} 德布罗煜
            </div>
        </div>
    );
}