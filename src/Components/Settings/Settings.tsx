import { SettingFilled } from "@ant-design/icons";
import { Anchor, Divider, Typography } from "antd";
import React, { useRef } from "react";
import About from "./About/About";
import Appearance from "./Appearance/Appearance";
import General from "./General/General";
import './style.scss';
import UmamusumeSetting from "./UmamusumeSetting/UmamusumeSetting";

export default function Settings() {
    const anchorRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <div className="anchorContainer">
                <Anchor
                    getContainer={() => (anchorRef.current ? anchorRef.current : window)}
                >
                    <Anchor.Link href='#general' title='通用设置' />
                    <Anchor.Link href='#appearance' title='外观设置' />
                    <Anchor.Link href='#umamusumes' title='赛马娘配置' />
                    <Anchor.Link href='#about' title='关于' />
                </Anchor>
            </div>
            <div className="settings" ref={anchorRef}>
                <div>
                    <Typography.Title level={3} id='general'>通用设置</Typography.Title>
                    <General />
                </div>
                <Divider>
                    <SettingFilled />
                </Divider>
                <div>
                    <Typography.Title level={3} id='appearance'>外观设置</Typography.Title>
                    <Appearance />
                </div>
                <Divider>
                    <SettingFilled />
                </Divider>
                <div>
                    <Typography.Title level={3} id='umamusumes'>赛马娘配置</Typography.Title>
                    <UmamusumeSetting />
                </div>
                <Divider>
                    <SettingFilled />
                </Divider>
                <div>
                    <Typography.Title level={3} id='about'>关于</Typography.Title>
                    <About />
                </div>
            </div>
        </>
    )
}