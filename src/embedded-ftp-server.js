/*
 * Here we implement a simple Ftp server.
 * The FTP Server listen on a localhost address. 
 */

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
				return process.cwd();
			}
		});
		server.listen(FTPCredentials.port);
	}
};


