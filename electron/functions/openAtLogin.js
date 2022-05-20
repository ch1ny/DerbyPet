const { app } = require('electron');
const cp = require('child_process');

function exchangeOpenAfterStartStatus(openAtLogin) {
	if (app.isPackaged) {
		if (openAtLogin) {
			cp.exec(
				`REG ADD HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run /v DerbyPet /t REG_SZ /d "${process.execPath}" /f`,
				(err) => {
					console.log(err);
				}
			);
		} else {
			cp.exec(
				`REG DELETE HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run /v DerbyPet /f`,
				(err) => {
					console.log(err);
				}
			);
		}
	}
}

function getOpenAfterStartStatus() {
	return new Promise((resolve) => {
		cp.exec(
			`REG QUERY HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run /v DerbyPet`,
			(err, stdout, stderr) => {
				if (err) {
					resolve(false);
				}
				resolve(stdout.indexOf('DerbyPet') >= 0);
			}
		);
	});
}

module.exports = {
	exchangeOpenAfterStartStatus,
	getOpenAfterStartStatus,
};
