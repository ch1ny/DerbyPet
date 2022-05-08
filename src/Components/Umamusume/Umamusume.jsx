import { Dropdown, Menu } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './style.scss';
import { umaMenu } from './umaMenu';
import { umaNameToUmaCode } from './umaNameToUmaCode';

export default function Umamusume(props) {
	const MY_UMA = localStorage.getItem('MY_UMA');
	const [umaName, setUmaName] = useState(MY_UMA ? MY_UMA : '特别周');

	const [showDropdown, setShowDropdown] = useState(false);

	const [domAble, setDomAble] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	useEffect(() => {
		document.onmousemove = (evt) => {
			if (!isDragging) {
				const flag = evt.path.length > 4;
				if (flag !== domAble) {
					window.ipc.send('EXCHANGE_DOM_ABLE', flag);
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
		const offset = JSON.parse(localStorage.getItem('PET_OFFSET'));
		if (Array.isArray(offset)) {
			setPosition(offset);
		}
	}, []);

	const [umaClicked, setUmaClicked] = useState(false);
	const desktopPetRef = useRef();
	const audioRef = useRef();
	useEffect(() => {
		const desktopPet = desktopPetRef.current;
		// 区分拖动事件、单击事件计时器
		let distinguishDragClickTimeout;
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
			const initialX = desktopPet.offsetLeft;
			const initialY = desktopPet.offsetTop;
			// 鼠标按下的坐标
			const startX = evt.clientX;
			const startY = evt.clientY;
			//鼠标抬起事件
			desktopPet.onmousemove = function (evt) {
				// 元素最终的位置
				let finalX = initialX + (evt.clientX - startX);
				let finalY = initialY + (evt.clientY - startY);

				// 边界越界及吸附判断
				if (finalX > document.documentElement.clientWidth - desktopPet.offsetWidth - 20) {
					finalX = document.documentElement.clientWidth - desktopPet.offsetWidth;
				} else if (finalX < 20) {
					finalX = 0;
				}
				if (finalY > document.documentElement.clientHeight - desktopPet.offsetHeight - 20) {
					finalY = document.documentElement.clientHeight - desktopPet.offsetHeight;
				} else if (finalY < 20) {
					finalY = 0;
				}
				// 设置元素移动位置
				setPosition([finalX, finalY]);
			};

			// 鼠标抬起事件
			desktopPet.onmouseup = function () {
				window.ipc.send('RELEASE_MOUSE');
				if (distinguishDragClickTimeout) {
					clearTimeout(distinguishDragClickTimeout);
					distinguishDragClickTimeout = null;
					if (!umaClicked) {
						audioRef.current.play();
					}
				} else {
					setIsDragging(false);
					localStorage.setItem(
						'PET_OFFSET',
						JSON.stringify([desktopPet.offsetLeft, desktopPet.offsetTop])
					);
				}
				desktopPet.onmousemove = null;
				desktopPet.onmouseleave = null;
				desktopPet.onmouseup = null;
			};

			desktopPet.onmouseleave = function () {
				window.ipc.send('RELEASE_MOUSE');
				if (distinguishDragClickTimeout) {
					clearTimeout(distinguishDragClickTimeout);
					distinguishDragClickTimeout = null;
					if (!umaClicked) {
						audioRef.current.play();
					}
				} else {
					setIsDragging(false);
					window.ipc.send('DRAG_RELEASE', [desktopPet.offsetLeft, desktopPet.offsetTop]);
				}
				desktopPet.onmousemove = null;
				desktopPet.onmouseup = null;
				desktopPet.onmouseleave = null;
			};
		};
	}, []);

	const menuFunc = function (e) {
		switch (e.key) {
			case 'START_GAME':
				audioRef.current.src = `https://cdn.jsdelivr.net/gh/AioliaRegulus/AudioCDN/Umamusume/Uma/UmamusumePrettyDerby~/${umaNameToUmaCode(
					umaName
				)}.mp3`;
				audioRef.current.load();
				window.ipc.send('START_GAME');
				audioRef.current.play();
				break;
			case 'QUIT':
				window.ipc.send('QUIT');
				break;
			case 'CHECK_FOR_UPDATE':
				props.checkForUpdate();
				break;
			default:
				setUmaName(e.key);
				audioRef.current.load();
				setUmaClicked(false);
				localStorage.setItem('MY_UMA', e.key);
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
					overlayClassName='desktopPetAbleDom'
					visible={showDropdown}
					onVisibleChange={setShowDropdown}>
					<img
						style={{
							left: `${position[0]}px`,
							top: `${position[1]}px`,
						}}
						ref={desktopPetRef}
						src={
							umaClicked
								? require(`./Uma/${umaName}1.png`)
								: require(`./Uma/${umaName}0.png`)
						}
						className='uma desktopPetAbleDom'
					/>
				</Dropdown>
				<audio
					ref={audioRef}
					preload='true'
					src={`https://cdn.jsdelivr.net/gh/AioliaRegulus/AudioCDN/Umamusume/Uma/${umaNameToUmaCode(
						umaName
					)}.mp3`}
					onPlay={() => {
						desktopPetRef.current.classList.remove('uma-rotateOut');
						desktopPetRef.current.classList.add('uma-rotateOut');
						setTimeout(() => {
							desktopPetRef.current.classList.remove('uma-rotateOut');
							desktopPetRef.current.classList.add('uma-rotateIn');
							setUmaClicked(true);
							setTimeout(() => {
								desktopPetRef.current.classList.remove('uma-rotateIn');
							}, 200);
						}, 200);
					}}
					onEnded={() => {
						audioRef.current.src = `https://cdn.jsdelivr.net/gh/AioliaRegulus/AudioCDN/Umamusume/Uma/${umaNameToUmaCode(
							umaName
						)}.mp3`;
						desktopPetRef.current.classList.add('uma-rotateOut');
						setTimeout(() => {
							desktopPetRef.current.classList.remove('uma-rotateOut');
							desktopPetRef.current.classList.add('uma-rotateIn');
							setUmaClicked(false);
							setTimeout(() => {
								desktopPetRef.current.classList.remove('uma-rotateIn');
							}, 200);
						}, 200);
					}}
				/>
			</div>
		</>
	);
}
