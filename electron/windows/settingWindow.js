const { BrowserWindow, screen, app, dialog } = require('electron');
const path = require('path');
const url = require('url');
const ipc = require('electron').ipcMain;
const { DIRNAME } = require('../main');
const { petWindow } = require('./petWindow');

let settingWindow;

function createSettingWindow() {
	settingWindow = new BrowserWindow({
		width: parseInt(screen.getPrimaryDisplay().workAreaSize.width * 0.6),
		height: parseInt(screen.getPrimaryDisplay().workAreaSize.height * 0.8),
		frame: false,
		transparent: true,
		show: false,
		resizable: false,
		minimizable: false,
		focusable: true,
		webPreferences: {
			preload: path.join(DIRNAME, 'electronAssets', 'preload.js'),
			devTools: !app.isPackaged,
			webSecurity: false,
		},
	});

	if (app.isPackaged) {
		settingWindow.loadURL(
			url.format({
				pathname: path.join(DIRNAME, 'setting/index.html'),
				protocol: 'file:',
				slashes: true,
			})
		);
	} else {
		settingWindow.loadURL('http://localhost:3000/setting');
	}

	settingWindow.once('ready-to-show', () => {
		settingWindow.show();
	});

	ipc.once('ASK_PET_WINDOW_FOR_REDUX', () => {
		petWindow().webContents.send('ASK_FOR_REDUX', settingWindow.webContents.id);
	});

	ipc.handleOnce('GET_PET_WINDOW_ID', () => {
		return petWindow().webContents.id;
	});

	ipc.once('CLOSE_SETTING_WINDOW', () => {
		settingWindow.close();
	});

	ipc.handle('SELECT_LOCAL_AUDIO', () => {
		return new Promise((resolve) => {
			settingWindow.setAlwaysOnTop(false);
			dialog
				.showOpenDialog({
					title: '选择自定义音频文件',
					filters: [{ name: '音频文件', extensions: ['mp3', 'ogg', 'wav'] }],
				})
				.then((res) => {
					resolve({ canceled: res.canceled, file: res.filePaths[0] });
				})
				.finally(() => {
					settingWindow.showInactive();
					settingWindow.moveTop();
					settingWindow.setAlwaysOnTop(true);
				});
		});
	});

	settingWindow.once('closed', () => {
		ipc.removeHandler('SELECT_LOCAL_AUDIO');
		settingWindow = null;
	});

	return settingWindow;
}

module.exports = {
	createSettingWindow,
	settingWindow: () => {
		if (settingWindow) return settingWindow;
		else {
			return createSettingWindow();
		}
	},
};
