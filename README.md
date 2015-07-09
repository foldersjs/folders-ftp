Folders-ftp
=============

This node.js package implements the folders.io synthetic file system.

This Folders Module is based on a ftp file system.It implements synthetic file system for **folders.io** over **ftp** protocol


### Installation 


To install 'folders-ftp' 

Installation (use --save to save to package.json)

```sh
npm install folders-ftp
```


Basic Usage


### Constructor

Constructor, could pass the special option/param in the config param.


```js
var FoldersFtp = require('folders-ftp');

var config = {
         
	// the connection string, format: ftp//username:password@host:port
    connectionString : "ftp://test:123456@localhost:3333",

	// the option to start up a embedded server when inin the folders, used in test/debug
    enableEmbeddedServer : true		
		 
};

var ftp = new FoldersFtp("localhost-ftp", config);
```

**'connectionString'**  attribute contains credentials for your remote / local ftp server. 
There is a in built ftp server comes embedded with this package which can be  used in testing/debug.
**'enableEmbeddedServer '** attribute can be passed to config to switch on / off that local ftp server.

###ls

```js
/**
 * @param uri, the uri on ftp server to ls
 * @param cb, callback function. 
 * ls(uri,cb)
 */
 
ftp.ls('.', function(err,data) {
        console.log("Folder listing", data);
});
```


###cat


```js

/**
 * @param uri, the file uri to cat 
 * @param cb, callback function.
 * cat(uri,cb) 
 */

ftp.cat('path/to/file', function(err,result) {
        console.log("Read Stream ", result.stream);
});
```

### write

```js

/**
 * @param path, string, the path 
 * @param data, the input data, 'stream.Readable' or 'Buffer'
 * @param cb, the callback function
 * write(path,data,cb)
 */

var writeData = getWriteStreamSomeHow('some_movie.mp4');

ftp.write('path/to/file',writeData, function(err,result) {
        console.log("Write status ", result);
});
```








