/*
 *
 * Folders.io provider: share an FTP endpoint.
 *
 */

var uriParse = require('url');
var jsftp = require('jsftp');
// var rush = require('node-rush');

var FoldersFtp = function(prefix,options) {
	this.prefix = prefix;
	this.connectionString = options.connectionString;
	this.server = null;
	
	// this is a feature to start a embedded Ftp server, using for test/debug
	var enableEmbeddedServer = options.enableEmbeddedServer || false;
	if (enableEmbeddedServer){
		var conn = parseConnString(this.connectionString);
		var Server = require('./embedded-ftp-server');
		this.server = new Server(conn);
		this.server.start(options.backend);
	}
};

module.exports = FoldersFtp;

FoldersFtp.prototype.features = FoldersFtp.features = {
	cat : true,
	ls : true,
	write : true,
	server : true
};

FoldersFtp.prototype.prepare = function() {
	// FIXME looks like new jsftp(conn) and self.ftp.socket.end() for every
	// action will caused some socket action. Need to check.
	// if write action after the ls action,
	// will caused the 'Error: write after end' when the second action
	var self = this;
	if (typeof (self.ftp) != 'undefined' && self.ftp != null) {
		return self.ftp;
	}

	var connectionString = this.connectionString;
	var conn = parseConnString(connectionString);
	
	console.log("folders-ftp, conn to server",conn);
	// NOTES: Could use rush; PWD/CWD needs to be known.
	return new jsftp(conn);
};

FoldersFtp.prototype.ls = function(path, cb) {
	var self = this;
	if (path!='.') {
		if (path.length && path.substr(0, 1) != "/")
			path = "/" + path;
		if (path.length && path.substr(-1) != "/")
			path = path + "/";
	}

	var cwd = path || "";
	//cwd = "";

	// NOTES: Not using connection pooling nor re-using the connection.
	self.ftp = this.prepare();
	
	/*
	self.ftp.ls(".", function(err, content) {
			if (err) {
				console.error(err);
				return cb(null, err);
			}

			console.log('ls returns: ', self.asFolders(path, content));
			cb(self.asFolders(path, content));

			// FIXME there is a socket error when use this module after socket.end()
			// self.ftp.socket.end();
		}); */
	
	self.ftp.raw.cwd(path, function(err, data) {
		if (err){
			console.error(err);
			return cb(null,err);
		}
		self.ftp.ls(".", function(err, content) {
			if (err) {
				console.error(err);
				return cb(null, err);
			}

			cb(self.asFolders(path, content));

			// FIXME there is a socket error when use this module after socket.end()
			// self.ftp.socket.end();
		});
	});
	
};

FoldersFtp.prototype.asFolders = function(dir, files) {
	var out = [];
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var o = {
			name : file.name
		};
		o.fullPath = dir + file.name;
		if (!o.meta)
			o.meta = {};
		var cols = [ 'permission', 'owner', 'group' ];
		file.permission = 0;
		// if(file.userPermissions, groupPermissions, otherPermissions:
		// read,write,exec)
		for ( var meta in cols)
			o.meta[cols[meta]] = file[cols[meta]];
		
		o.uri = "#" + this.prefix + o.fullPath;
		o.size = file.size || 0;
		
		//FIXME: does not look right here!
		o.extension = "txt";
		o.type = "text/plain";
		if (file.type == '1') {
			o.extension = '+folder';
			o.type = "";
		}
		if (file.type == '2') {
			// symlink/redirection.
			o.extension = '+folder';
			o.type = "";
		}

		out.push(o);
	}
	return out;
};

FoldersFtp.prototype.cat = function(data, cb) {
	var self = this;
	var path = data;
	if (path.length && path.substr(0, 1) != "/")
		path = "/" + path;

	// var cwd = path || "";

	// NOTES: Not using connection pooling nor re-using the connection.
	self.ftp = this.prepare();

	// TODO more stat and file check before cat
	self.ftp.ls(path, function(err, content) {

		if (err) {
			console.error(err);
			cb(null, err);
		}

		var files = self.asFolders(path, content);

		if (files.length <= 0) {
			console.error("file not exist");
			cb(null, error);
		}
		var file = files[0];

		self.ftp.get(path, function(err, socket) {

			// var str = "";
			// socket.on("data", function(d) {str += d;});
			// socket.on("close", function(hadErr) {socket.end();});

			cb({
				// return socket readable stream
				stream: socket, 
				size: file.size,
				name: file.name
			});

			// self.ftp.socket.end();
		});
	});

};

FoldersFtp.prototype.write = function(uri, data, cb) {
	var self = this;

	// TODO uri normalize

	self.ftp = this.prepare();
	//NOTES, the jsftp lib support both buffer/Readable stream as input source.
	self.ftp.put(data, uri, function(err) {
		if (err) {
			console.error("File transferred failed,", err);
			return cb(null, err);
		}

		console.log("File transferred successfully!");
		cb("write uri success");
		// self.ftp.socket.end();
	});
};

var parseConnString = function(connectionString){
	var uri = uriParse.parse(connectionString, true);
	var conn = {
		host : uri.hostname || uri.host,
		port : uri.port || 21
	};
	if (uri.auth) {
		var auth = uri.auth.split(":", 2);
		conn.user = auth[0];
		if (auth.length == 2) {
			conn.pass = auth[1];
		}
	}
	conn.debugMode = true;
	
	return conn;
}
