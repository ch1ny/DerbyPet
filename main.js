const {
	app,
	BrowserWindow,
	Tray,
	Menu,
	screen,
	nativeImage,
	globalShortcut,
	shell,
} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');

let mainWindow;

const ipc = require('electron').ipcMain;
const DIRNAME = process.env.NODE_ENV === 'development' ? path.join(__dirname, 'public') : __dirname;
const EXEPATH = path.dirname(app.getPath('exe'));

let tray = null;

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
		skipTaskbar: true,
		focusable: false,
		webPreferences: {
			preload: path.join(DIRNAME, 'electronAssets', 'preload.js'),
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
		{
			label: '打开主面板',
			click: () => {
				if (mainWindow) mainWindow.show();
				else createMainWindow();
			},
			icon: nativeImage
				.createFromPath(path.join(DIRNAME, 'electronAssets/trayIcon/showWindow.png'))
				.resize({
					width: 16,
					height: 16,
					quality: 'best',
				}),
		},
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

	tray = new Tray(path.join(DIRNAME, 'electronAssets', 'favicon.ico'));
	tray.setToolTip(`ウマ娘 Pretty Derby\n(¯﹃¯)\n德比桌宠`);
	tray.setContextMenu(contextMenu);
	tray.on('click', () => {
		if (mainWindow) {
			mainWindow.restore();
			mainWindow.moveTop();
		} else createMainWindow();
	});

	mainWindow.once('closed', () => {
		mainWindow = null;
	});

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.setIgnoreMouseEvents(true, {
			forward: true,
		});
		// if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
	});

	mainWindow.on('minimize', () => {
		mainWindow.restore();
		mainWindow.moveTop();
	});

	ipc.on('EXCHANGE_DOM_ABLE', (event, able) => {
		if (able) {
			mainWindow.setIgnoreMouseEvents(!able);
		} else {
			mainWindow.setIgnoreMouseEvents(true, {
				forward: true,
			});
		}
	});

	ipc.on('RELEASE_MOUSE', () => {
		mainWindow.showInactive();
		mainWindow.moveTop();
	});

	ipc.handle('APP_VERSION', () => {
		const version = app.getVersion();
		return version;
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
		if (process.env.NODE_ENV !== 'development')
			globalShortcut.register('CommandOrControl+Shift+I', () => {
				console.log('你想打开开发者工具？あげません！');
			});

		createMainWindow();

		ipc.once('QUIT', () => {
			app.quit();
		});

		ipc.once('READY_TO_UPDATE', () => {
			if (process.env.NODE_ENV !== 'development') readyToUpdate();
		});

		ipc.handle('DOWNLOADED_UPDATE_ZIP', (event, data) => {
			fs.writeFileSync(path.join(EXEPATH, 'resources', 'update.zip'), data, 'binary');
			return true;
		});

		ipc.on('START_GAME', () => {
			shell.openExternal('dmmgameplayer://umamusume/cl/general/umamusume');
		});
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit();
	});

	app.on('activate', () => {
		if (mainWindow === null) createMainWindow();
	});

	app.on('will-quit', () => {
		if (process.env.NODE_ENV !== 'development') globalShortcut.unregisterAll();
		app.releaseSingleInstanceLock();
	});

	function readyToUpdate() {
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
	}
}
