const { app, BrowserWindow, Tray, Menu, screen, nativeImage, shell } = require('electron');
const path = require('path');
const url = require('url');
const ipc = require('electron').ipcMain;
const { DIRNAME } = require('../main');

let petWindow;
let tray = null;

const windowIcon = nativeImage
	.createFromPath(path.join(DIRNAME, 'electronAssets/trayIcon/showWindow.png'))
	.resize({
		width: 16,
		height: 16,
		quality: 'best',
	});
const closePetWindowContext = {
	label: '关闭渲染进程',
	click: () => {
		if (petWindow) petWindow.close();
	},
	icon: windowIcon,
};
const openPetWindowContext = {
	label: '开启渲染进程',
	click: () => {
		if (petWindow) {
			petWindow.restore();
			petWindow.moveTop();
		} else createPetWindow();
	},
	icon: windowIcon,
};

function createPetWindow() {
	petWindow = new BrowserWindow({
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
			devTools: !app.isPackaged,
			webSecurity: false,
		},
	});

	if (process.env.NODE_ENV === 'development') {
		petWindow.loadURL('http://localhost:3000/main');
	} else {
		petWindow.loadURL(
			url.format({
				pathname: path.join(DIRNAME, 'main/index.html'),
				protocol: 'file:',
				slashes: true,
			})
		);
	}

	const contextMenu = Menu.buildFromTemplate([
		closePetWindowContext,
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
			if (petWindow) {
				petWindow.showInactive();
				petWindow.moveTop();
			} else createPetWindow();
		});
	}
	tray.setContextMenu(contextMenu);

	petWindow.once('ready-to-show', () => {
		petWindow.show();
		petWindow.setIgnoreMouseEvents(true, {
			forward: true,
		});
	});

	const exchangeDomAble = (event, able) => {
		if (able) {
			petWindow.setIgnoreMouseEvents(!able);
		} else {
			petWindow.setIgnoreMouseEvents(true, {
				forward: true,
			});
		}
	};
	ipc.on('EXCHANGE_DOM_ABLE', exchangeDomAble);

	const startGame = () => {
		shell.openExternal('dmmgameplayer://play/GCL/umamusume/cl/win');
	};
	ipc.on('START_GAME', startGame);

	petWindow.once('closed', () => {
		ipc.removeListener('EXCHANGE_DOM_ABLE', exchangeDomAble);
		ipc.removeListener('START_GAME', startGame);
		petWindow = null;
		tray.setContextMenu(
			Menu.buildFromTemplate([
				openPetWindowContext,
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

module.exports = {
	createPetWindow,
	petWindow: () => {
		return petWindow;
	},
};
