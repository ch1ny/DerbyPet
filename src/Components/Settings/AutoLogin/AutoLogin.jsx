import { Checkbox } from 'antd';
import React, { useState } from 'react';

export default function AutoLogin() {
	const [autoLogin, setAutoLogin] = useState(localStorage.getItem('autoLogin') === 'true');

	return (
		<>
			<Checkbox
				checked={autoLogin}
				onChange={(e) => {
					setAutoLogin(e.target.checked);
					localStorage.setItem('autoLogin', e.target.checked);
				}}>
				自动登录
			</Checkbox>
		</>
	);
}
