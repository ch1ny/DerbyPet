import { CloudDownloadOutlined, ImportOutlined, PoweroffOutlined, SettingOutlined, UserSwitchOutlined } from '@ant-design/icons';
import React from 'react';
import * as umas from './Uma/umas.json';

const umamusumes = Object.values(umas)
umamusumes.pop()

export const umaMenu = [
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
