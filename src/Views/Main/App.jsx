import { Modal } from 'antd';
import axios from 'axios';
import { globalMessage } from 'Components/GlobalMessage/GlobalMessage';
import Umamusume from 'Components/Umamusume/Umamusume';
import UpdateBubbles from 'Components/UpdateBubble/UpdateBubbles';
import React, { useEffect, useState } from 'react';
import './App.scss';

function needUpdate(nowVersion, targetVersion) {
	const nowArr = nowVersion.split('.').map((i) => Number(i));
	const newArr = targetVersion.split('.').map((i) => Number(i));
	const lessLength = Math.min(nowArr.length, newArr.length);
	for (let i = 0; i < lessLength; i++) {
		if (nowArr[i] < newArr[i]) {
			return true;
		} else if (nowArr[i] > newArr[i]) {
			return false;
		}
	}
	if (nowArr.length < newArr.length) return true;
	return false;
}

export default function App() {
	const [appVersion, setAppVersion] = useState(undefined);
	const [latestVersion, setLatestVersion] = useState(undefined);
	useEffect(() => {
		window.ipc.invoke('APP_VERSION').then((version) => {
			setAppVersion(version);
		});
	}, []);

	const [updating, setUpdating] = useState(false);

	return (
		<>
			<Umamusume
				checkForUpdate={() => {
					axios
						.get('https://assets.aiolia.top/ElectronApps/DerbyPet/manifest.json', {
							headers: {
								'Cache-Control': 'no-cache',
							},
						})
						.then((res) => {
							const { latest } = res.data;
							if (needUpdate(appVersion, latest)) setLatestVersion(latest);
							else globalMessage.success({ content: '当前已是最新版本，无需更新' });
						});
				}}
			/>

			<UpdateBubbles visible={updating} targetVersion={latestVersion} />

			<Modal
				visible={latestVersion !== undefined}
				centered
				title='检测到新版本'
				cancelText='取消'
				okText='更新'
				onCancel={() => {
					setLatestVersion(undefined);
				}}
				onOk={() => {
					setUpdating(true);
					setLatestVersion(undefined);
				}}>
				检测到存在新版本 V {latestVersion} ，是否下载更新？
			</Modal>
		</>
	);
}
