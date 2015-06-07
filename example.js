var FoldersFtp = require('./src/folders-ftp');

var Fio = require('folders');
var FolderFs = Fio.fs();
var Provider = Fio.stub();
var backend = new Provider();


var mock  = new FolderFs(backend);

/*
mock.stat(".", function(err, data) {
	console.log("read", data);
});
*/

var str = "ftp://test:123456@localhost:3333";
var ftp = new FoldersFtp("localhost-ftp", {
	connectionString: str,
	enableEmbeddedServer: true,
	backend: function() { return mock; }
});

// These two should match.
backend.ls('.', function(data) {
	console.log("cool", data);
});
ftp.ls('.', function(data) {
	console.log("oh", data);
});
