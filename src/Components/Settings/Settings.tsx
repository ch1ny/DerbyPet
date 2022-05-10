import { SettingFilled } from "@ant-design/icons";
import { Anchor, Divider, Modal } from "antd";
import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import About from "./About/About";
import Appearance from "./Appearance/Appearance";
import './style.scss';

interface SettingsProps {
    visible: boolean,
    closeFunc: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

export default function Settings(props: SettingsProps) {
    const [disabled, setDisabled] = useState(true)
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 })

    const draggleRef = useRef<HTMLDivElement | null>(null)

    const anchorRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <Modal
                title={
                    <div
                        style={{ width: '100%', userSelect: 'none', cursor: 'move' }}
                        onMouseOver={() => {
                            setDisabled(false)
                        }}
                        onMouseOut={() => {
                            setDisabled(true)
                        }}
                    >应用设置</div>
                }
                wrapClassName={'settingsModalWrap'}
                visible={props.visible}
                onCancel={props.closeFunc}
                centered={true}
                footer={null}
                destroyOnClose={false}
                mask={false}
                maskClosable={false}
                width={'50vw'}
                modalRender={modal => (
                    <Draggable
                        disabled={disabled}
                        bounds={bounds}
                        onStart={(evt, uiData) => {
                            const { clientWidth, clientHeight } = window.document.documentElement
                            const targetRect = (draggleRef.current as HTMLDivElement).getBoundingClientRect()
                            if (!targetRect) return;
                            setBounds({
                                left: -targetRect.left + uiData.x - (draggleRef.current as HTMLDivElement).clientWidth + 50,
                                right: clientWidth - (targetRect.right - uiData.x) + (draggleRef.current as HTMLDivElement).clientWidth - 50,
                                top: -targetRect.top + uiData.y,
                                bottom: clientHeight - (targetRect.bottom - uiData.y) + (draggleRef.current as HTMLDivElement).clientHeight - 50,
                            })
                        }}
                    >
                        <div ref={draggleRef}>{modal}</div>
                    </Draggable>
                )}
            >
                <div className="settingContainer">
                    <div className="anchorContainer">
                        <Anchor
                            getContainer={() => (anchorRef.current ? anchorRef.current : window)}
                        >
                            <Anchor.Link href='#appearance' title='外观设置' />
                            <Anchor.Link href='#umamusumes' title='赛马娘配置' />
                            <Anchor.Link href='#about' title='关于' />
                        </Anchor>
                    </div>
                    <div className="settings" ref={anchorRef}>
                        <div>
                            <h2 id='appearance'>外观设置</h2>
                            <Appearance />
                        </div>
                        <Divider>
                            <SettingFilled />
                        </Divider>
                        <div>
                            <h2 id='umamusumes'>赛马娘配置</h2>
                        </div>
                        <Divider>
                            <SettingFilled />
                        </Divider>
                        <div>
                            <h2 id="about">关于</h2>
                            <About />
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}