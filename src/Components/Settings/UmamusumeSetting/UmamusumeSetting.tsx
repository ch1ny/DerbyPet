import { CustomerServiceOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Divider, Image, Select, Typography } from "antd";
import { globalMessage } from "Components/GlobalMessage/GlobalMessage";
import React, { useContext, useEffect, useRef, useState } from "react";
import { setModifiedList, setUmaMusume } from "Utils/Store/actions";
import store from "Utils/Store/store";
import { UmasMapActionTypes, UmasMapPayload, UmasMapPayloadAudio, UmasMapPayloadPic } from "Utils/Types";
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

    const [modifiedUmas, setModifiedUmas] = useState(store.getState().modifiedList);
    useEffect(() => store.subscribe(() => {
        const newModifiedUmas = store.getState().modifiedList
        if (modifiedUmas !== newModifiedUmas) {
            setModifiedUmas(newModifiedUmas);
            (window as any).ipc.invoke('SET_MODIFIED_JSON', JSON.stringify(newModifiedUmas))
        }
    }), [])

    const handleModify = (type: string, url: string) => {
        const defaultJson = ((require('Views/Main/umas')) as { [key: string]: UmasMapPayload })[`${nowUma}`];

        const payload = Object.assign({}, umaInfo, {
            audio: Object.assign({}, (umaInfo.audio as UmasMapPayloadAudio), {
                [`${type}`]: url
            })
        });

        (audioRef.current as HTMLAudioElement).pause()

        if (defaultJson.audio?.click === payload.audio.click && defaultJson.audio?.start === payload.audio.start) {
            const newModifiedUmas = Object.assign({}, modifiedUmas)
            delete newModifiedUmas[`${nowUma}` as keyof typeof newModifiedUmas]
            store.dispatch(setModifiedList(newModifiedUmas))
        } else {
            store.dispatch(setModifiedList(Object.assign({}, modifiedUmas, {
                [`${payload.key}`]: payload
            })))
        }

        if (dispatchUmasMap)
            dispatchUmasMap({
                type: UmasMapActionTypes.ADD_INTO_UMA_MUSUMES_LIST, payload: payload as UmasMapPayload
            })
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
                    onDefault={() => {
                        handleModify('click', `https://cdn.jsdelivr.net/gh/ch1ny/AudioCDN/Umamusume/Uma/${umaNameToCode(nowUma)}.mp3`)
                    }}
                    onModify={(url) => { handleModify('click', url) }}
                />
                <UmaAudio
                    title="启动游戏"
                    audio={(umaInfo.audio as UmasMapPayloadAudio).start}
                    onPlay={handlePlay}
                    onDefault={() => {
                        handleModify('start', `https://cdn.jsdelivr.net/gh/ch1ny/AudioCDN/Umamusume/Uma/UmamusumePrettyDerby~/${umaNameToCode(nowUma)}.mp3`)
                    }}
                    onModify={(url) => { handleModify('start', url) }}
                />
                <audio ref={audioRef} />
            </div>
        </div>
    )
}

interface UmaAudioProps {
    title: string,
    audio: string,
    onPlay?: (audio: string) => void,
    onModify?: (newUrl: string) => void,
    onDefault?: Function
}
function UmaAudio(props: UmaAudioProps) {
    const handleUpdateUrl = (newUrl: string) => {
        if (newUrl === props.audio) {
            globalMessage.info('未发生改动')
            return
        }
        const audioRegex = new RegExp(/.(mp3|ogg|wav)$/, 'i')
        if (audioRegex.test(newUrl)) {
            if (props.onModify) {
                props.onModify(newUrl)
            }
            globalMessage.success('自定义修改成功')
        } else {
            globalMessage.error('仅支持 mp3、ogg、wav 格式')
        }
    }

    return (
        <div className="umaAudios">
            <Divider orientation="left" style={{ marginBlock: '10px' }}>
                <Typography.Title level={5}>{props.title}</Typography.Title>
            </Divider>
            <div className="buttons">
                <Button type="primary" icon={<CustomerServiceOutlined />} onClick={() => { if (props.onPlay) props.onPlay(props.audio) }}>试听</Button>
                {/* {
                    showUrl
                        ? <Button icon={<CheckCircleOutlined />} type='primary' onClick={handleUpdateUrl}>确认</Button>
                        : <Button icon={<EditOutlined />} onClick={() => { setShowUrl(true) }}>自定义</Button>
                } */}
                <Button icon={<EditOutlined />} onClick={() => {
                    (window as any).ipc.invoke('SELECT_AUDIO').then((res: { canceled: boolean, file: string }) => {
                        if (!res.canceled) handleUpdateUrl(res.file)
                    })
                }}>自定义</Button>
                <Button icon={<ReloadOutlined />} onClick={() => { if (props.onDefault) props.onDefault(); globalMessage.success('恢复完毕') }}>恢复默认</Button>
            </div>
        </div>
    )
}

function umaNameToCode(umaName: string): string {
    switch (umaName) {
        case '特别周':
        case '泳装特别周':
            return 'SpecialWeek';
        case '无声铃鹿':
            return 'SilenceSuzuka';
        case '东海帝王':
        case '礼装东海帝王':
            return 'TokaiTeio';
        case '目白麦昆':
        case '礼装目白麦昆':
            return 'MejiroMcQueen';
        case '鲁道夫象征':
        case '和服鲁道夫象征':
            return 'SymboliRudolf';
        case '小栗帽':
        case '圣诞小栗帽':
            return 'OguriCap';
        case '大树快车':
            return 'TaikiShuttle';
        case '米浴':
        case '万圣节米浴':
            return 'RiceShower';
        case '竹正歌剧王':
        case '春节竹正歌剧王':
            return 'T.M.OperaO';
        case '美浦波旁':
        case '情人节美浦波旁':
            return 'MihonoBourbon';
        case '琵琶晨光':
        case '圣诞琵琶晨光':
            return 'BiwaHayahide';
        case '丸善斯基':
        case '泳装丸善斯基':
            return 'MaruZensky';
        case '真机伶':
            return 'CurrenChan';
        case '成田大进':
            return 'NaritaTaishin';
        case '醒目飞鹰':
            return 'SmartFalcon';
        case '成田白仁':
            return 'NaritaBrian';
        case '空中欢歌':
        case '婚纱空中欢歌':
            return 'AirGroove';
        case '摩耶重炮':
        case '婚纱摩耶重炮':
            return 'MayanoTopGun';
        case '星云天空':
        case '礼装星云天空':
            return 'SeiunSky';
        case '菱亚马逊':
            return 'HishiAmazon';
        case '草上飞':
        case '治愈师草上飞':
            return 'GrassWonder';
        case '神鹰':
        case '格斗家神鹰':
            return 'ElCondorPasa';
        case '富士奇迹':
        case '礼装富士奇迹':
            return 'FujiKiseki';
        case '黄金城市':
        case '和服黄金城市':
            return 'GoldCity';
        case '名将怒涛':
            return 'MeishoDoto';
        case '荣进闪耀':
        case '情人节荣进闪耀':
            return 'EishinFlash';
        case '待兼福来':
        case '礼装待兼福来':
            return 'Matikanefukukitaru';
        case '菱曙':
            return 'HishiAkebono';
        case '爱丽数码':
            return 'AgnesDigital';
        case '超级小海湾':
        case '万圣节超级小海湾':
            return 'SuperCreek';
        case '川上公主':
            return 'KawakamiPrincess';
        case '曼城茶座':
            return 'ManhattanCafe';
        case '东瀛佐敦':
            return 'TosenJordan';
        case '目白多伯':
            return 'MejiroDober';
        case '美妙姿势':
            return 'FineMotion';
        case '玉藻十字':
            return 'TamamoCross';
        case '春乌拉拉':
        case '春节春乌拉拉':
            return 'HaruUrara';
        case '樱花千代王':
            return 'SakuraChiyonoO';
        case '目白阿尔丹':
            return 'MejiroArdan';
        case '爱慕织姬':
            return 'AdmireVega';
        case '北部玄驹':
            return 'KitasanBlack';
        case '里见光钻':
            return 'SatonoDiamond';
        case '目白光明':
            return 'MejiroBright';
        case '西野花':
            return 'NishinoFlower';
        case '八重无敌':
            return 'YaenoMuteki';
        case '大和赤骥':
            return 'DaiwaScarlet';
        case '黄金船':
            return 'GoldShip';
        case '伏特加':
            return 'Vodka';
        case '待兼诗歌剧':
            return 'Matikanetannhauser';
        case '目白赖恩':
            return 'MejiroRyan';
        case '胜利奖券':
            return 'WinningTicket';
        case '爱丽速子':
            return 'AgnesTachyon';
        case '樱花进王':
            return 'SakuraBakushinO';
        case '优秀素质':
        case '啦啦队优秀素质':
            return 'NiceNature';
        case '帝王光辉':
        case '应援团帝王光辉':
            return 'KingHalo';
        default:
            return ''
    }
}