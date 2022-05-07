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
	},
	ipcRenderer
);
contextBridge.exposeInMainWorld('ipc', _ipcRenderer);
