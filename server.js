var net  = require('net');
var util = require('util');
var _    = require('underscore');
var mesg  = require('./message.js');
String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};

var options = Array();
process.argv.forEach(function (val, index, array) {
	options.push(val);
});

function qDebug(msg){
	if(_.indexOf(options, 'debug') != -1){
		console.log(msg);
	}
}


var datastore = {}
var count     = 0;
var msgRegex  = /\!\!\@\@\#\#\$\$(.*?)\$\$\#\#\@\@\!\!/gi;
var server = net.createServer({}, function (socket) {
	socket.on('connect', function(){
		this.buffer = "";
		qDebug('Hello, friend.');
	});
	socket.on('end', function(){
		qDebug('Goodbye, friend.');
	});
	socket.on('data', function(data){
		var line = this.buffer + data.toString();
		var done = "";
		while((messages = msgRegex.exec(line)) != null){
			done += '!!@@##$$' + messages[1] + '$$##@@!!';
			try{
				command = messages[1].substr(0, 4);
				data    = messages[1].substr(5);
				if(command == "STOR"){
					var x  = data.indexOf(" ");
					var key = data.substr(0, x);
					var val = data.substr(x+1);
					datastore[key] = val;
					socket.write('!!@@##$$OK   ' + key + '$$##@@!!');
				} else if(command == "RETR"){
					if(data in datastore){
						//console.log('Retreiving "'+data+'" "'+datastore[data]+'"');
						socket.write('!!@@##$$DATA ' + data + ' ' + datastore[data] + '$$##@@!!');
					} else {
						//console.log('Data not found');
						socket.write('!!@@##$$ERRO ' + data + ' KEY NOT FOUND$$##@@!!');
					}
				} else {
					socket.write('!!@@##$$ERRO 0000 UNKNOWN COMMAND$$##@@!!');
				}
			} catch(err){
				console.log('Error parsing sent messages');
				console.log('-----');
				console.log(err.toString());
				console.log('-----');
			}
		}

		this.buffer = line.replace(done, "");;
		//console.log('Messages received: ' + count);
	});
});

server.listen(1337, '127.0.0.1');
