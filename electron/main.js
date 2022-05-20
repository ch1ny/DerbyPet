const { app } = require('electron');
const path = require('path');

module.exports = {
	DIRNAME: path.join(__dirname, '..', app.isPackaged ? '.' : 'public'),
	EXEPATH: path.dirname(app.getPath('exe')),
};
