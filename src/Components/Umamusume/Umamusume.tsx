import { CloudDownloadOutlined, ImportOutlined, PoweroffOutlined, SettingOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { throttle } from 'Utils/Global';
import { setUmaMusume } from 'Utils/Store/actions';
import store from 'Utils/Store/store';
import { UmasMapPayload, UmasMapPayloadAudio, UmasMapPayloadPic } from 'Utils/Types';
import './style.scss';

interface UmamusumeProps {
	checkForUpdate: Function;
}
const translateRegex = new RegExp(/.*?translate\((\d{1,})px, (\d{1,})px\).*?/)

function returnUmaPics(umasMap: Map<string, UmasMapPayload>, umaName: string, umaClicked: boolean) {
	const pics = ((umasMap.get(umaName) as UmasMapPayload).pic as [UmasMapPayloadPic, UmasMapPayloadPic])
	return (
		<>
			<img
				src={pics[0].modify ? require(`${pics[0].url}`) : require(`Assets/${pics[0].url}`)}
				className={classNames({
					uma: true,
					'uma-hidden': umaClicked,
				})}
			/>
			<img
				src={pics[0].modify ? require(`${pics[1].url}`) : require(`Assets/${pics[1].url}`)}
				className={classNames({
					uma: true,
					'uma-hidden': !umaClicked,
				})}
			/>
		</>
	)
}

export default function Umamusume(props: UmamusumeProps) {
	const reduxState = store.getState()
	const [umaName, setUmaName] = useState(reduxState.umaMusume);
	const [needOpacity, setNeedOpacity] = useState(reduxState.needOpacity)
	const [umaOpacity, setUmaOpacity] = useState(reduxState.umaOpacity)
	useEffect(() => {
		const unsubscribe = store.subscribe(() => {
			const { umaMusume, needOpacity, umaOpacity } = store.getState()
			setUmaName(umaMusume);
			setNeedOpacity(needOpacity)
			setUmaOpacity(umaOpacity);
		});
		const MY_UMA = localStorage.getItem('MY_UMA');
		if (MY_UMA) {
			store.dispatch(setUmaMusume(MY_UMA));
		}
		return unsubscribe;
	}, []);
	useEffect(() => {
		localStorage.setItem('MY_UMA', umaName);
		if (audioRef.current) {
			audioRef.current.load();
		}
		setUmaClicked(false);
	}, [umaName]);

	const [showDropdown, setShowDropdown] = useState(false);

	const [domAble, setDomAble] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	useEffect(() => {
		const [throttleMouseMove, clearThrottleMouseMove] = throttle((evt: MouseEvent) => {
			if (!isDragging) {
				const flag = evt.composedPath().length > 6;
				setDomAble(flag);
			}
		}, 200)
		document.onmousemove = throttleMouseMove;
		return () => {
			document.onmousemove = null;
			clearThrottleMouseMove()
		};
	}, []);
	useEffect(() => {
		(window as any).ipc.send('EXCHANGE_DOM_ABLE', domAble);
		if (!domAble) {
			setShowDropdown(false);
		}
	}, [domAble])

	const [position, setPosition] = useState([0, 0]);
	useEffect(() => {
		const offset = JSON.parse(String(localStorage.getItem('PET_OFFSET')));
		if (Array.isArray(offset)) {
			setPosition(offset);
		}
	}, []);

	const [umaClicked, setUmaClicked] = useState(false);
	const desktopPetRef = useRef<HTMLImageElement | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	useEffect(() => {
		const desktopPet = desktopPetRef.current;
		if (desktopPet) {
			// 区分拖动事件、单击事件计时器
			let distinguishDragClickTimeout: any;
			desktopPet.onmousedown = (evt) => {
				// 仅匹配鼠标左键
				if (evt.button !== 0) {
					return;
				}
				distinguishDragClickTimeout = setTimeout(() => {
					setIsDragging(true);
					distinguishDragClickTimeout = null;
				}, 150);
				// 获取元素起始位置
				const transform = desktopPet.style.transform
				const translate = translateRegex.exec(transform)
				if (!translate) return
				const initialX = Number(translate[1]);
				const initialY = Number(translate[2]);
				// 鼠标按下的坐标
				const startX = evt.clientX;
				const startY = evt.clientY;

				const moveThrottle = throttle(function (evt: MouseEvent) {
					// 元素最终的位置
					let finalX = initialX + (evt.clientX - startX);
					let finalY = initialY + (evt.clientY - startY);
					// 边界越界及吸附判断
					if (
						finalX >
						document.documentElement.clientWidth - desktopPet.offsetWidth - 20
					) {
						finalX = document.documentElement.clientWidth - desktopPet.offsetWidth;
					} else if (finalX < 20) {
						finalX = 0;
					}
					if (
						finalY >
						document.documentElement.clientHeight - desktopPet.offsetHeight - 20
					) {
						finalY = document.documentElement.clientHeight - desktopPet.offsetHeight;
					} else if (finalY < 20) {
						finalY = 0;
					}
					// 设置元素移动位置
					setPosition([finalX, finalY]);
				}, 3)
				desktopPet.onmousemove = moveThrottle[0]

				const onRelease = function () {
					(window as any).ipc.send('RELEASE_MOUSE');
					if (distinguishDragClickTimeout) {
						clearTimeout(distinguishDragClickTimeout);
						distinguishDragClickTimeout = null;
						if (!umaClicked && audioRef.current) {
							audioRef.current.play();
						}
					} else {
						setIsDragging(false);
						const transform = desktopPet.style.transform;
						const translate = translateRegex.exec(transform);
						if (translate)
							localStorage.setItem(
								'PET_OFFSET',
								JSON.stringify([translate[1], translate[2]])
							);
					}
					moveThrottle[1]
					desktopPet.onmousemove = null;
				};

				// 鼠标抬起事件
				desktopPet.onmouseup = function () {
					desktopPet.onmouseleave = null;
					onRelease()
					desktopPet.onmouseup = null;
				};

				desktopPet.onmouseleave = function () {
					desktopPet.onmouseup = null;
					onRelease()
					desktopPet.onmouseleave = null;
				};
			};
		}
	}, []);

	const [umasMap, setUmasMap] = useState(store.getState().umasMap)
	useEffect(() => store.subscribe(() => {
		setUmasMap(store.getState().umasMap)
	}), [])

	const umamusumes = (() => {
		const umasArray = []
		for (const [key, val] of umasMap) {
			umasArray.push({
				key: key,
				label: val.label
			})
		}
		return umasArray;
	})()

	const menuFunc = function (evt: { key: string }) {
		switch (evt.key) {
			case 'START_GAME':
				if (audioRef.current) {
					audioRef.current.src =
						((umasMap.get(umaName) as UmasMapPayload).audio as UmasMapPayloadAudio).start
					audioRef.current.load();
					(window as any).ipc.send('START_GAME');
					audioRef.current.play();
				}
				break;
			case 'QUIT':
				(window as any).ipc.send('QUIT');
				break;
			case 'CHECK_FOR_UPDATE':
				props.checkForUpdate();
				break;
			case 'SETTINGS':
				(window as any).ipc.send('SHOW_SETTINGS')
				break;
			default:
				store.dispatch(setUmaMusume(
					umasMap.has(evt.key) ? evt.key : '特别周'
				))
				break;
		}
		setShowDropdown(false);
	};

	const dropdownRef = useRef<HTMLDivElement | null>(null)

	const umaMenu = [
		{
			label: '启动游戏',
			key: 'START_GAME',
			icon: <PoweroffOutlined />,
		},
		{
			label: '更换马娘',
			key: 'CHANGE_UMAMUSUME',
			popupOffset: [-2, 0],
			popupClassName: 'umamusumesCanChoose',
			icon: <UserSwitchOutlined />,
			children: umamusumes,
		},
		{
			label: '检查更新',
			key: 'CHECK_FOR_UPDATE',
			icon: <CloudDownloadOutlined />,
		},
		{
			label: '应用设置',
			key: 'SETTINGS',
			icon: <SettingOutlined />,
		},
		{
			label: '退出应用',
			key: 'QUIT',
			icon: <ImportOutlined />,
		},
	];

	return (
		<>
			<div className='desktopPet' ref={dropdownRef}>
				<Dropdown
					overlay={<Menu className='contextMenu' onClick={menuFunc} items={umaMenu} />}
					trigger={['contextMenu']}
					visible={showDropdown}
					onVisibleChange={setShowDropdown}
					getPopupContainer={() => (dropdownRef.current ? dropdownRef.current : document.body)}
					destroyPopupOnHide={true}
				>
					<div
						className='desktopContainer'
						style={{
							transform: `translate(${position[0]}px, ${position[1]}px)`
						}}
						ref={desktopPetRef}>
						<div style={{ opacity: needOpacity && !domAble ? umaOpacity : 1 }}>
							{
								returnUmaPics(umasMap, umaName, umaClicked)
							}
						</div>
					</div>
				</Dropdown>
				<audio
					ref={audioRef}
					preload='true'
					src={((umasMap.get(umaName) as UmasMapPayload).audio as UmasMapPayloadAudio).click}
					onPlay={() => {
						if (desktopPetRef.current) {
							desktopPetRef.current.classList.remove('desktopContainer-rotateOut');
							desktopPetRef.current.classList.add('desktopContainer-rotateOut');
							setTimeout(() => {
								if (desktopPetRef.current) {
									desktopPetRef.current.classList.remove(
										'desktopContainer-rotateOut'
									);
									desktopPetRef.current.classList.add(
										'desktopContainer-rotateIn'
									);
									setUmaClicked(true);
									setTimeout(() => {
										if (desktopPetRef.current)
											desktopPetRef.current.classList.remove(
												'desktopContainer-rotateIn'
											);
									}, 200);
								}
							}, 200);
						}
					}}
					onEnded={() => {
						if (audioRef.current && desktopPetRef.current) {
							audioRef.current.src =
								((umasMap.get(umaName) as UmasMapPayload).audio as UmasMapPayloadAudio).click;
							desktopPetRef.current.classList.add('desktopContainer-rotateOut');
							setTimeout(() => {
								if (desktopPetRef.current) {
									desktopPetRef.current.classList.remove(
										'desktopContainer-rotateOut'
									);
									desktopPetRef.current.classList.add(
										'desktopContainer-rotateIn'
									);
									setUmaClicked(false);
									setTimeout(() => {
										if (desktopPetRef.current)
											desktopPetRef.current.classList.remove(
												'desktopContainer-rotateIn'
											);
									}, 200);
								}
							}, 200);
						}
					}}
				/>
			</div>
		</>
	);
}
