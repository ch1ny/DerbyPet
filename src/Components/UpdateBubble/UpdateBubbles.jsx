import { Progress, Typography } from 'antd';
import axios from 'axios';
import classNames from 'classnames';
import { globalMessage } from 'Components/GlobalMessage/GlobalMessage';
import React, { useEffect, useState } from 'react';
import './style.scss';

export default function UpdateBubbles(props) {
	const [total, setTotal] = useState(Infinity);
	const [loaded, setLoaded] = useState(0);
	const [targetVersion, setTargetVersion] = useState(undefined);

	useEffect(() => {
		if (props.targetVersion !== undefined) {
			setTargetVersion(props.targetVersion);
		}
	}, [props.targetVersion]);

	useEffect(() => {
		if (props.visible) {
			axios
				.get(
					`https://assets.aiolia.top/ElectronApps/DerbyPet/${targetVersion}/update.zip`,
					{
						responseType: 'blob',
						onDownloadProgress: (evt) => {
							const { loaded, total } = evt;
							setTotal(total);
							setLoaded(loaded);
						},
						headers: {
							'Cache-Control': 'no-cache',
						},
					}
				)
				.then((res) => {
					const fr = new FileReader();
					fr.onload = () => {
						window.ipc.invoke('DOWNLOADED_UPDATE_ZIP', fr.result).then(() => {
							setTimeout(() => {
								window.ipc.send('READY_TO_UPDATE');
							}, 750);
						});
					};
					fr.readAsBinaryString(res.data);
					globalMessage.success({ content: '更新包下载完毕，即将重启应用...' });
				});
		}
	}, [props.visible]);

	return (
		<>
			<div
				className={classNames({
					updateBubbleContainer: true,
					[`updateBubbleContainerHidden`]: !props.visible,
				})}>
				<div className='updateBubble'>
					<Typography.Title level={3}>正在下载更新，请勿退出应用</Typography.Title>
					<Progress
						percent={Number(((loaded / total) * 100).toFixed(0))}
						status={loaded === total ? 'success' : 'active'}
					/>
				</div>
			</div>
		</>
	);
}
