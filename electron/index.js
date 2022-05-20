const { app } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { EXEPATH } = require('./main');
const { createPetWindow, petWindow } = require('./windows/petWindow');
const { createSettingWindow, settingWindow } = require('./windows/settingWindow');
const {
	getOpenAfterStartStatus,
	exchangeOpenAfterStartStatus,
} = require('./functions/openAtLogin');

const ipc = require('electron').ipcMain;

const instanceLockData = { instanceName: 'Derby Pet' };
const instanceLock = app.requestSingleInstanceLock(instanceLockData);

if (!instanceLock) app.quit();
else {
	app.on('second-instance', (event, commandLine, workingDirectory, instanceLockData) => {
		console.log('Someone tried to run a second instance');
	});

	app.on('ready', () => {
		createPetWindow();

		ipc.once('QUIT', () => {
			app.quit();
		});

		ipc.once('READY_TO_UPDATE', () => {
			if (process.env.NODE_ENV === 'development') return;
			const { spawn } = require('child_process');
			const child = spawn(
				path.join(EXEPATH, 'resources', 'ReadyUpdater.exe'),
				['YES_I_WANNA_UPDATE_ASAR'],
				{
					detached: true,
					shell: true,
				}
			);
			const _petWindow = petWindow();
			const _settingWindow = settingWindow();
			if (_petWindow) _petWindow.close();
			if (_settingWindow) _settingWindow.close();
			child.unref();
			app.quit();
		});

		let modifyJson = fs.readJSONSync(path.join(EXEPATH, 'resources', 'modify.json'), {
			throws: false,
		});
		ipc.handle('GET_MODIFIED_JSON', () => {
			return modifyJson === null ? {} : modifyJson;
		});
		ipc.handle('SET_MODIFIED_JSON', (evt, json) => {
			modifyJson = JSON.parse(json);
			fs.writeJSONSync(path.join(EXEPATH, 'resources', 'modify.json'), modifyJson);
		});

		ipc.handle('DOWNLOADED_UPDATE_ZIP', (event, data) => {
			fs.writeFileSync(path.join(EXEPATH, 'resources', 'update.zip'), data, 'binary');
			return true;
		});

		ipc.handle('APP_VERSION', app.getVersion);

		ipc.on('SHOW_SETTINGS', () => {
			settingWindow();
		});

		ipc.on('EXCHANGE_OPEN_AFTER_START_STATUS', (evt, openAtLogin) => {
			exchangeOpenAfterStartStatus(openAtLogin);
		});
		ipc.handle('GET_OPEN_AFTER_START_STATUS', getOpenAfterStartStatus);

		if (!app.isPackaged)
			ipc.on('DEBUG_INFO', (evt, info) => {
				console.log(info);
			});
	});

	app.on('window-all-closed', () => {});

	app.on('will-quit', () => {
		app.releaseSingleInstanceLock();
	});
}
