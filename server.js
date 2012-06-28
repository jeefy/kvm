var net = require('net');
String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};

var datastore = Array();

var server = net.createServer(function (socket) {
	socket.on('connect', function(){
		console.log('Hello, friend.');
	});
	socket.on('end', function(){
		console.log('Goodbye, friend.');
	});
	socket.on('data', function(data){
		msg = data.toString().trim();
		parts = msg.split('!@#$');
		if(parts.length<2){
			socket.write('bad command\n');
		} else {
			switch(parts[0]){
				case "s":
					id = datastore.push(parts[1]) - 1;
					socket.write('id:' + id);
					break;
				case "g":
					try{
						socket.write(datastore[parts[1]]);
					} catch(err){
						socket.write('key not found\n');
					}
					break;
				default:
					socket.write('bad command\n');
					break;
			}
		}
	});
});

server.listen(1337, '127.0.0.1');
