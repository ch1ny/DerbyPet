const { app, BrowserWindow, Tray, Menu, screen, nativeImage, shell, dialog } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

let mainWindow;

const ipc = require('electron').ipcMain;
const DIRNAME = process.env.NODE_ENV === 'development' ? path.join(__dirname, 'public') : __dirname;
const EXEPATH = path.dirname(app.getPath('exe'));

let tray = null;
const mainWindowIcon = nativeImage
	.createFromPath(path.join(DIRNAME, 'electronAssets/trayIcon/showWindow.png'))
	.resize({
		width: 16,
		height: 16,
		quality: 'best',
	});
const closeMainWindowContext = {
	label: '关闭渲染进程',
	click: () => {
		if (mainWindow) mainWindow.close();
	},
	icon: mainWindowIcon,
};
const openMainWindowContext = {
	label: '开启渲染进程',
	click: () => {
		if (mainWindow) {
			mainWindow.restore();
			mainWindow.moveTop();
		} else createMainWindow();
	},
	icon: mainWindowIcon,
};

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: screen.getPrimaryDisplay().workAreaSize.width - 1,
		height: screen.getPrimaryDisplay().workAreaSize.height - 1,
		frame: false,
		transparent: true,
		show: false,
		resizable: false,
		alwaysOnTop: true,
		minimizable: false,
		focusable: false,
		skipTaskbar: true,
		webPreferences: {
			preload: path.join(DIRNAME, 'electronAssets', 'preload.js'),
			devTools: process.env.NODE_ENV === 'development',
			webSecurity: false,
		},
	});

	if (process.env.NODE_ENV === 'development') {
		mainWindow.loadURL('http://localhost:3000/main');
	} else {
		mainWindow.loadURL(
			url.format({
				pathname: path.join(DIRNAME, 'main/index.html'),
				protocol: 'file:',
				slashes: true,
			})
		);
	}

	const contextMenu = Menu.buildFromTemplate([
		closeMainWindowContext,
		{
			type: 'separator',
		},
		{
			label: '退出',
			click: () => {
				app.quit();
			},
			icon: nativeImage
				.createFromPath(path.join(DIRNAME, 'electronAssets/trayIcon/quit.png'))
				.resize({
					width: 16,
					height: 16,
					quality: 'best',
				}),
		},
	]);

	if (!tray) {
		tray = new Tray(path.join(DIRNAME, 'electronAssets', 'favicon.ico'));
		tray.setToolTip(`ウマ娘 Pretty Derby\n(¯﹃¯)\n德比桌宠`);
		tray.on('click', () => {
			if (mainWindow) {
				mainWindow.showInactive();
				mainWindow.moveTop();
			} else createMainWindow();
		});
	}
	tray.setContextMenu(contextMenu);

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.setIgnoreMouseEvents(true, {
			forward: true,
		});

		// if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
	});

	const exchangeDomAble = (event, able) => {
		if (able) {
			mainWindow.setIgnoreMouseEvents(!able);
		} else {
			mainWindow.setIgnoreMouseEvents(true, {
				forward: true,
			});
		}
	};
	ipc.on('EXCHANGE_DOM_ABLE', exchangeDomAble);

	// ipc.on('RELEASE_MOUSE', () => {
	// 	mainWindow.showInactive();
	// 	mainWindow.moveTop();
	// });

	ipc.handle('APP_VERSION', app.getVersion);
	ipc.handle('SELECT_AUDIO', () => {
		return new Promise((resolve) => {
			mainWindow.setAlwaysOnTop(false);
			dialog
				.showOpenDialog({
					title: '选择自定义音频文件',
					filters: [{ name: '音频文件', extensions: ['mp3', 'ogg', 'wav'] }],
				})
				.then((res) => {
					// console.log(res);
					resolve({ canceled: res.canceled, file: res.filePaths[0] });
				})
				.finally(() => {
					mainWindow.showInactive();
					mainWindow.moveTop();
					mainWindow.setAlwaysOnTop(true);
				});
		});
	});

	mainWindow.once('closed', () => {
		ipc.removeListener('EXCHANGE_DOM_ABLE', exchangeDomAble);
		ipc.removeHandler('APP_VERSION');
		ipc.removeHandler('SELECT_AUDIO');
		mainWindow = null;
		tray.setContextMenu(
			Menu.buildFromTemplate([
				openMainWindowContext,
				{
					type: 'separator',
				},
				{
					label: '退出',
					click: () => {
						app.quit();
					},
					icon: nativeImage
						.createFromPath(path.join(DIRNAME, 'electronAssets/trayIcon/quit.png'))
						.resize({
							width: 16,
							height: 16,
							quality: 'best',
						}),
				},
			])
		);
	});
}

const instanceLockData = { instanceName: 'Derby Pet' };
const instanceLock = app.requestSingleInstanceLock(instanceLockData);

if (!instanceLock) app.quit();
else {
	app.on('second-instance', (event, commandLine, workingDirectory, instanceLockData) => {
		console.log('Someone tried to run a second instance');
	});

	app.on('ready', () => {
		createMainWindow();

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
			if (mainWindow) mainWindow.close();
			child.unref();
			app.quit();
		});

		const modifyJson = fs.readJSONSync(path.join(EXEPATH, 'resources', 'modify.json'), {
			throws: false,
		});
		ipc.handle('GET_MODIFIED_JSON', () => {
			return modifyJson === null ? {} : modifyJson;
		});
		ipc.handle('SET_MODIFIED_JSON', (evt, json) => {
			fs.writeJSONSync(path.join(EXEPATH, 'resources', 'modify.json'), JSON.parse(json));
		});

		ipc.handle('DOWNLOADED_UPDATE_ZIP', (event, data) => {
			fs.writeFileSync(path.join(EXEPATH, 'resources', 'update.zip'), data, 'binary');
			return true;
		});

		ipc.on('START_GAME', () => {
			shell.openExternal('dmmgameplayer://play/GCL/umamusume/cl/win');
		});

		if (process.env.NODE_ENV === 'development')
			ipc.on('DEBUG_INFO', (evt, info) => {
				console.log(info);
			});
	});

	app.on('window-all-closed', () => {});

	app.on('activate', () => {
		if (mainWindow === null) createMainWindow();
	});

	app.on('will-quit', () => {
		app.releaseSingleInstanceLock();
	});
}
