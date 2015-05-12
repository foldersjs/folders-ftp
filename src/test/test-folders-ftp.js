var FoldersFtp = new require('../folders-ftp');

// This test suite will use a embedded localhost FTP server
// If you want to test against a remote server,
// simply change the `host` and `port` properties as well or specify the
// hostname.
var FTPCredentials = {
	// hostname : test-ftp-server
	host : "localhost",
	port : 3333,
	user : "test",
	pass : "123456"
};

// if we specify a localhost server.
// we start a embedded ftp test server
var ftpServer = null;
if (FTPCredentials.host === "localhost") {

	var ftpd = require("ftpd");
	ftpServer = ftpd;
	/*
	ftpServer = require("ftp-test-server");
	server = new ftpServer();
	server.init(FTPCredentials);
	*/
	server = new ftpd.FtpServer('127.0.0.1', {
		getInitialCwd: function () {
			return '/';
		},
		getRoot: function () {
			return process.cwd();
		}
	});
	server.listen(FTPCredentials.port);

	// server.server.stdout.on('data', function(data) {
	// console.log("server side, recv out data:");
	// console.log(data);
	// // dbgServer(data.toString());
	// });
	//
	// server.server.stderr.on('data', function(data) {
	// console.log("server side, recv err data:");
	// console.log(data);
	// // dbgServer(data.toString());
	// });
	//
	// server.on('error', function(data) {
	// console.log("server side, recv error: ");
	// console.log(data);
	// // dbgServer(data.toString());
	// });
}

// "user:123456@localhost:3333";
var FTPCredentialsConnString = "ftp://";
if (typeof (FTPCredentials.user) != 'undefined' && typeof (FTPCredentials.pass) != 'undefined') {
	FTPCredentialsConnString += FTPCredentials.user + ":" + FTPCredentials.pass + "@";
}
if (typeof (FTPCredentials.host) != 'undefined' && typeof (FTPCredentials.port) != 'undefined') {
	FTPCredentialsConnString += FTPCredentials.host + ":" + FTPCredentials.port;
} else if (typeof (FTPCredentials.hostname) != 'undefined') {
	FTPCredentialsConnString += FTPCredentials.hostname;
}

// start the folder-ftp provider.
var ftp = new FoldersFtp(FTPCredentialsConnString, "localhost-ftp");
// test file uri,
// TODO may want use a /tmp dir file or a special dir in codebase for
// testing.
var testFileUri = "/test.dat";

describe('test for command ls/put/cat', function() {
	it('should cat the file data we put', function(done) {
		this.timeout(5000);

		// step 1: ls command, show the files in current dir
		ftp.ls('/', function(data) {
			console.log("ftp server: ls /");
			console.log(data);

			// step 2: write command, put data to ftp server
			var buf = new Buffer((new Array(960 + 1)).join("Z"));
			var writeReq = {
				data : buf,
				streamId : "test-stream-id",
				shareId : "test-share-id",
				uri : testFileUri
			};
			ftp.write(writeReq, function(data) {

				console.log("\nwrite buffer(960 Z) to the ftp server,result");
				console.log(data);

				// step 3: cat command, get the file we put to ftp server
				var readReq = {
					data : {
						fileId : testFileUri,
						streamId : "test-stream-id",
					},
					shareId : "test-share-id"
				};
				ftp.cat(readReq, function(result) {
					console.log("\nget file on ftp server,result");
					console.log(data);

					var socket = result.data;
					// TODO consume socket stream here
					// var str = "";
					// socket.on("data", function(d) {str += d;});
					// socket.on("close", function(hadErr) {});
					console.log("\nclose the socket stream");
					socket.end();

					// stop the test ftp server
					// FIXME there still is a `Error: read ECONNRESET` in stop the server.
					if (ftpServer != null) {
						// server.stop();
						server.close();
						done();
					}
				});
			});

		});
	});
});

// });
