import { message } from 'antd';
message.config({
	top: '10vh',
	maxCount: 2,
	duration: 1,
});

export { message as globalMessage };
