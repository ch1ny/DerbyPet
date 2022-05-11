import { CustomerServiceOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Divider, Image, Select, Typography } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import { setUmaMusume } from "Utils/Store/actions";
import store from "Utils/Store/store";
import { UmasMapPayload, UmasMapPayloadAudio, UmasMapPayloadPic } from "Utils/Types";
import { UmasMapContext } from "Views/Main/App";
import './style.scss';

function returnUmaPics(umasMap: Map<string, UmasMapPayload>, nowUma: string, container: HTMLDivElement) {
    const pics = ((umasMap.get(nowUma) as UmasMapPayload).pic as [UmasMapPayloadPic, UmasMapPayloadPic])
    return (
        <>
            <Image
                src={pics[0].modify ? require(`${pics[0].url}`) : require(`Assets/${pics[0].url}`)}
                preview={false}
            />
            <Image
                src={pics[1].modify ? require(`${pics[1].url}`) : require(`Assets/${pics[1].url}`)}
                preview={false}
            />
        </>
    )
}

export default function UmamusumeSetting() {
    const [nowUma, setNowUma] = useState(store.getState().umaMusume)
    useEffect(() => store.subscribe(() => {
        setNowUma(store.getState().umaMusume)
    }), [])

    const [umasMap, dispatchUmasMap] = useContext(UmasMapContext)

    const picsContainerRef = useRef<HTMLDivElement | null>(null)

    const umaInfo = umasMap.get(nowUma) as UmasMapPayload

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const handlePlay = function (audioUrl: string) {
        const audio = (audioRef.current as HTMLAudioElement)
        audio.pause()
        audio.src = audioUrl;
        audio.play()
    }

    return (
        <div className="settingUmamusume">
            <div className="nowChosen">
                <Typography.Title level={4}>当前正在使用的看板马娘</Typography.Title>
                <Select
                    showSearch
                    onChange={(value) => {
                        store.dispatch(setUmaMusume(value))
                    }}
                    filterOption={(input, option) => {
                        return (option?.value as string).indexOf(input) >= 0
                    }}
                    style={{ width: '10em' }}
                    defaultValue={nowUma}
                >
                    <>
                        {
                            (() => {
                                const options = []
                                for (const [key, value] of umasMap) {
                                    options.push(
                                        <Select.Option value={key} key={key}>{key}</Select.Option>
                                    )
                                }
                                return options
                            })()
                        }
                    </>
                </Select>
            </div>
            <div className="chosenUmaPics" ref={picsContainerRef}>
                {
                    returnUmaPics(umasMap, nowUma, picsContainerRef.current as HTMLDivElement)
                }
            </div>
            <div className="umaAudioSetting">
                <Typography.Title level={4}>音频配置</Typography.Title>
                <UmaAudio
                    title="点击互动"
                    audio={(umaInfo.audio as UmasMapPayloadAudio).click}
                    onPlay={handlePlay}
                />
                <UmaAudio
                    title="启动游戏"
                    audio={(umaInfo.audio as UmasMapPayloadAudio).start}
                    onPlay={handlePlay}
                />
                <audio ref={audioRef} />
            </div>
        </div>
    )
}

interface UmaAudioProps {
    title: string,
    audio: string
    onPlay?: (audio: string) => void
}
function UmaAudio(props: UmaAudioProps) {
    return (
        <div className="umaAudios">
            <Divider orientation="left" style={{ marginBlock: '10px' }}>
                <Typography.Title level={5}>{props.title}</Typography.Title>
            </Divider>
            <div className="buttons">
                <Button type="primary" icon={<CustomerServiceOutlined />} onClick={() => { if (props.onPlay) props.onPlay(props.audio) }}>试听</Button>
                <Button icon={<EditOutlined />}>自定义</Button>
                <Button icon={<ReloadOutlined />}>恢复默认</Button>
            </div>
        </div>
    )
}