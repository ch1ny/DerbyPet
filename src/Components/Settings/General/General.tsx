import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Checkbox } from "antd";
import React, { useEffect, useState } from "react";

export default function General() {
    const [openAtLogin, setOpenAtLogin] = useState(false);
    useEffect(() => {
        (window as any).ipc.invoke('GET_OPEN_AFTER_START_STATUS').then((openAtLogin: boolean) => {
            setOpenAtLogin(openAtLogin)
        })
    }, [])

    const [autoCheckForUpdate, setAutoCheckForUpdate] = useState(localStorage.getItem('autoCheckForUpdate') !== 'false')

    return (
        <>
            <div>
                <Checkbox
                    checked={openAtLogin}
                    onChange={(evt) => {
                        setOpenAtLogin(evt.target.checked);
                        (window as any).ipc.send('EXCHANGE_OPEN_AFTER_START_STATUS', evt.target.checked)
                    }}
                >
                    开机时启动
                </Checkbox>
            </div>
            <span style={{ color: 'red', fontSize: '0.825em', fontWeight: 'bold' }}><ExclamationCircleOutlined /> 这是一项试验性功能，请谨慎启用</span>
            <div style={{ marginTop: '0.5em' }}>
                <Checkbox
                    checked={autoCheckForUpdate}
                    onChange={(evt) => {
                        setAutoCheckForUpdate(evt.target.checked);
                        localStorage.setItem('autoCheckForUpdate', String(evt.target.checked))
                    }}
                >
                    启动时检查更新
                </Checkbox>
            </div>
        </>
    )
}