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
        </>
    )
}