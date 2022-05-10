import { Dropdown, Menu } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { setUmaMusume } from 'Utils/Store/actions';
import store from 'Utils/Store/store';
import './style.scss';
import * as umas from './Uma/umas.json';
import { umaMenu } from './umaMenu';

interface UmamusumeProps {
	checkForUpdate: Function;
	showSetting: Function;
}
const translateRegex = new RegExp(/.*?translate\((\d{1,})px, (\d{1,})px\).*?/)

export default function Umamusume(props: UmamusumeProps) {
	const [umaName, setUmaName] = useState('特别周');
	useEffect(() => {
		const unsubscribe = store.subscribe(() => {
			setUmaName(store.getState().umaMusume);
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
		document.onmousemove = (evt) => {
			if (!isDragging) {
				const flag = evt.composedPath().length > 7;
				if (flag !== domAble) {
					(window as any).ipc.send('EXCHANGE_DOM_ABLE', flag);
					setDomAble(flag);
				}
			}
		};
		if (!domAble) {
			setShowDropdown(false);
		}
		return () => {
			document.onmousemove = null;
		};
	}, [domAble]);

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
				//鼠标抬起事件
				desktopPet.onmousemove = function (evt) {
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
				};

				// 鼠标抬起事件
				desktopPet.onmouseup = function () {
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
					desktopPet.onmousemove = null;
					desktopPet.onmouseleave = null;
					desktopPet.onmouseup = null;
				};

				desktopPet.onmouseleave = function () {
					(window as any).ipc.send('RELEASE_MOUSE');
					if (distinguishDragClickTimeout) {
						clearTimeout(distinguishDragClickTimeout);
						distinguishDragClickTimeout = null;
						if (!umaClicked && audioRef.current) {
							audioRef.current.play();
						}
					} else {
						setIsDragging(false);
					}
					desktopPet.onmousemove = null;
					desktopPet.onmouseup = null;
					desktopPet.onmouseleave = null;
				};
			};
		}
	}, []);

	const menuFunc = function (evt: { key: string }) {
		switch (evt.key) {
			case 'START_GAME':
				if (audioRef.current) {
					audioRef.current.src =
						umas[`${umaName}` as keyof typeof umas]['audio']['start'];
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
				props.showSetting();
				break;
			default:
				store.dispatch(setUmaMusume(
					Object.prototype.hasOwnProperty.call(umas, evt.key) ? evt.key : '特别周'
				))
				break;
		}
		setShowDropdown(false);
	};

	return (
		<>
			<div className='desktopPet'>
				<Dropdown
					overlay={<Menu onClick={menuFunc} items={umaMenu} />}
					trigger={['contextMenu']}
					visible={showDropdown}
					onVisibleChange={setShowDropdown}>
					<div
						className='desktopContainer'
						style={{
							transform: `translate(${position[0]}px, ${position[1]}px)`
						}}
						ref={desktopPetRef}>
						<img
							src={require(`./Uma/pic/${umaName}0.png`)}
							className={classNames({
								uma: true,
								'uma-hidden': umaClicked,
							})}
						/>
						<img
							src={require(`./Uma/pic/${umaName}1.png`)}
							className={classNames({
								uma: true,
								'uma-hidden': !umaClicked,
							})}
						/>
					</div>
				</Dropdown>
				<audio
					ref={audioRef}
					preload='true'
					src={umas[`${umaName}` as keyof typeof umas]['audio']['click']}
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
								umas[`${umaName}` as keyof typeof umas]['audio']['click'];
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
