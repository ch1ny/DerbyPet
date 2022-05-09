import { message } from "antd";

const vh = window.innerHeight / 100

message.config({
    top: 10 * vh,
    maxCount: 2,
    duration: 1,
});

export { message as globalMessage };

