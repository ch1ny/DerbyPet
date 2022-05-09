import { message } from "antd";

const vh = document.body.clientHeight / 100

message.config({
    top: 10 * vh,
    maxCount: 2,
    duration: 1,
});

export { message as globalMessage };
