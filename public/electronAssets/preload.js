const { contextBridge, ipcRenderer } = require('electron');

const _ipcRenderer = Object.assign(
	{
		on: (channel, cb) => {
			ipcRenderer.on(channel, cb);
		},
		once: (channel, cb) => {
			ipcRenderer.once(channel, cb);
		},
		removeEventListener: (channel, cb) => {
			ipcRenderer.removeListener(channel, cb);
		},
		sendTo: (webContentsId, channel, ...args) => {
			ipcRenderer.sendTo(webContentsId, channel, ...args);
		},
	},
	ipcRenderer
);
contextBridge.exposeInMainWorld('ipc', _ipcRenderer);
