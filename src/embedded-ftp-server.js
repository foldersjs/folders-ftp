/*
 * Here we implement a simple Ftp server.
 * The FTP Server listen on a localhost address. 
 */

var Fio = require('folders');

var Server = function(credentials){
	this.FTPCredentials = credentials;
	this.ftpServer = null;
	console.log("inin the FTP Embedded server,",credentials);
};

module.exports = Server;

Server.prototype.close = function(){
	if (this.sshServer != null){
		this.sshServer.close();
	}
};

Server.prototype.start = function(){
	var FTPCredentials = this.FTPCredentials;
	console.log("start the FTP Embedded server,",FTPCredentials);
	if (FTPCredentials.host === "localhost") {

		var ftpd = require("ftpd");
		ftpServer = ftpd;

		server = new ftpd.FtpServer('127.0.0.1', {
			getInitialCwd: function () {
				return '/';
			},
			getRoot: function () {
				// also sends conn string, may be better connect point.
				return process.cwd();
			}
		});

		var mock = new Fio.fs(new Fio.stub());
		mock.readdir = function(path, cb) {
			console.log('read', dir);
		};
		mock.open = function(dir, cb) {
			console.log('open', dir);
		};
		mock.stat = function(path, cb) {
			console.log('stat', dir);
			cb(null, stat);
		};

		server.on('client:connected', function(conn) {
			var username;
			// console.log(conn.socket.remoteAddress);
			conn.on('command:user', function(user, success, failure) {
				username = user;
				success();
				// failure();
			});
			conn.on('command:pass', function(pass, success, failure) {
				success(username, mock);
				// failure();
			});
		});

		server.listen(FTPCredentials.port);
	}
};

