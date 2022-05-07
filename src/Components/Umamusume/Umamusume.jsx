import { Dropdown, Menu } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './style.scss';

export default function Umamusume(props) {
	const MY_UMA = localStorage.getItem('MY_UMA');
	const [umaName, setUmaName] = useState(MY_UMA ? MY_UMA : '特别周');

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
	};

	return (
		<>
			<div className='desktopPet'>
				<Dropdown
					overlay={<Menu onClick={menuFunc}>{menu}</Menu>}
					trigger={['contextMenu']}
					overlayClassName='desktopPetAbleDom'>
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
					preload
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

const { SubMenu } = Menu;
const menu = (
	<>
		<Menu.Item key='START_GAME'>开始游戏</Menu.Item>
		<SubMenu
			key='CHANGE_UMAMUSUME'
			title='更换马娘'
			popupOffset={[-2, 0]}
			popupClassName='umamusumesCanChoose'>
			{/* 这里注释掉的马娘都是我还没抽到的QWQ, 没法录音 */}
			<Menu.Item key='特别周'>特别周</Menu.Item>
			<Menu.Item key='泳装特别周'>泳装特别周</Menu.Item>
			<Menu.Item key='无声铃鹿'>无声铃鹿</Menu.Item>
			<Menu.Item key='东海帝王'>东海帝王</Menu.Item>
			<Menu.Item key='礼装东海帝王'>礼装东海帝王</Menu.Item>
			<Menu.Item key='目白麦昆'>目白麦昆</Menu.Item>
			<Menu.Item key='礼装目白麦昆'>礼装目白麦昆</Menu.Item>
			{/* <Menu.Item key='鲁道夫象征'>鲁道夫象征</Menu.Item>
			<Menu.Item key='和服鲁道夫象征'>和服鲁道夫象征</Menu.Item> */}
			<Menu.Item key='丸善斯基'>丸善斯基</Menu.Item>
			<Menu.Item key='泳装丸善斯基'>泳装丸善斯基</Menu.Item>
			<Menu.Item key='小栗帽'>小栗帽</Menu.Item>
			<Menu.Item key='圣诞小栗帽'>圣诞小栗帽</Menu.Item>
			<Menu.Item key='大树快车'>大树快车</Menu.Item>
			<Menu.Item key='米浴'>米浴</Menu.Item>
			<Menu.Item key='万圣节米浴'>万圣节米浴</Menu.Item>
			<Menu.Item key='竹正歌剧王'>竹正歌剧王</Menu.Item>
			<Menu.Item key='春节竹正歌剧王'>春节竹正歌剧王</Menu.Item>
			{/* <Menu.Item key='美浦波旁'>美浦波旁</Menu.Item>
			<Menu.Item key='情人节美浦波旁'>情人节美浦波旁</Menu.Item> */}
			<Menu.Item key='琵琶晨光'>琵琶晨光</Menu.Item>
			<Menu.Item key='圣诞琵琶晨光'>圣诞琵琶晨光</Menu.Item>
			<Menu.Item key='真机伶'>真机伶</Menu.Item>
			{/* <Menu.Item key='成田大进'>成田大进</Menu.Item> */}
			<Menu.Item key='醒目飞鹰'>醒目飞鹰</Menu.Item>
			<Menu.Item key='成田白仁'>成田白仁</Menu.Item>
			<Menu.Item key='空中欢歌'>空中欢歌</Menu.Item>
			<Menu.Item key='婚纱空中欢歌'>婚纱空中欢歌</Menu.Item>
			<Menu.Item key='摩耶重炮'>摩耶重炮</Menu.Item>
			<Menu.Item key='婚纱摩耶重炮'>婚纱摩耶重炮</Menu.Item>
			{/* <Menu.Item key='星云天空'>星云天空</Menu.Item>
			<Menu.Item key='礼装星云天空'>礼装星云天空</Menu.Item> */}
			{/* <Menu.Item key='菱亚马逊'>菱亚马逊</Menu.Item> */}
			<Menu.Item key='草上飞'>草上飞</Menu.Item>
			<Menu.Item key='治愈师草上飞'>治愈师草上飞</Menu.Item>
			<Menu.Item key='神鹰'>神鹰</Menu.Item>
			<Menu.Item key='格斗家神鹰'>格斗家神鹰</Menu.Item>
			{/* <Menu.Item key='富士奇迹'>富士奇迹</Menu.Item>
			<Menu.Item key='礼装富士奇迹'>礼装富士奇迹</Menu.Item> */}
			<Menu.Item key='黄金城市'>黄金城市</Menu.Item>
			<Menu.Item key='和服黄金城市'>和服黄金城市</Menu.Item>
			{/* <Menu.Item key='名将怒涛'>名将怒涛</Menu.Item> */}
			<Menu.Item key='荣进闪耀'>荣进闪耀</Menu.Item>
			<Menu.Item key='情人节荣进闪耀'>情人节荣进闪耀</Menu.Item>
			<Menu.Item key='待兼福来'>待兼福来</Menu.Item>
			<Menu.Item key='礼装待兼福来'>礼装待兼福来</Menu.Item>
			<Menu.Item key='菱曙'>菱曙</Menu.Item>
			{/* <Menu.Item key='爱丽数码'>爱丽数码</Menu.Item> */}
			<Menu.Item key='超级小海湾'>超级小海湾</Menu.Item>
			<Menu.Item key='万圣节超级小海湾'>万圣节超级小海湾</Menu.Item>
			{/* <Menu.Item key='川上公主'>川上公主</Menu.Item> */}
			<Menu.Item key='曼城茶座'>曼城茶座</Menu.Item>
			<Menu.Item key='东瀛佐敦'>东瀛佐敦</Menu.Item>
			{/* <Menu.Item key='目白多伯'>目白多伯</Menu.Item> */}
			{/* <Menu.Item key='美妙姿势'>美妙姿势</Menu.Item> */}
			{/* <Menu.Item key='玉藻十字'>玉藻十字</Menu.Item> */}
			<Menu.Item key='春乌拉拉'>春乌拉拉</Menu.Item>
			<Menu.Item key='春节春乌拉拉'>春节春乌拉拉</Menu.Item>
			<Menu.Item key='樱花千代王'>樱花千代王</Menu.Item>
			{/* <Menu.Item key='目白阿尔丹'>目白阿尔丹</Menu.Item> */}
			{/* <Menu.Item key='爱慕织姬'>爱慕织姬</Menu.Item> */}
			<Menu.Item key='北部玄驹'>北部玄驹</Menu.Item>
			{/* <Menu.Item key='里见光钻'>里见光钻</Menu.Item> */}
			{/* <Menu.Item key='目白光明'>目白光明</Menu.Item> */}
			{/* <Menu.Item key='西野花'>西野花</Menu.Item> */}
			{/* <Menu.Item key='八重无敌'>八重无敌</Menu.Item> */}
			<Menu.Item key='大和赤骥'>大和赤骥</Menu.Item>
			<Menu.Item key='黄金船'>黄金船</Menu.Item>
			<Menu.Item key='伏特加'>伏特加</Menu.Item>
			<Menu.Item key='待兼诗歌剧'>待兼诗歌剧</Menu.Item>
			<Menu.Item key='目白赖恩'>目白赖恩</Menu.Item>
			<Menu.Item key='胜利奖券'>胜利奖券</Menu.Item>
			<Menu.Item key='爱丽速子'>爱丽速子</Menu.Item>
			<Menu.Item key='樱花进王'>樱花进王</Menu.Item>
			<Menu.Item key='优秀素质'>优秀素质</Menu.Item>
			<Menu.Item key='啦啦队优秀素质'>啦啦队优秀素质</Menu.Item>
			<Menu.Item key='帝王光辉'>帝王光辉</Menu.Item>
			<Menu.Item key='应援团帝王光辉'>应援团帝王光辉</Menu.Item>
		</SubMenu>
		<Menu.Item key='CHECK_FOR_UPDATE'>检查更新</Menu.Item>
		<Menu.Item key='QUIT'>退出应用</Menu.Item>
	</>
);

function umaNameToUmaCode(umaName) {
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
	}
}
