var sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

var cluster = require('cluster')
    , net       = require('net')
    , extPort   = 'tcp://127.0.0.1:1337'
    , threads   = 6
    , dataStore = {}
    , serverIds = {}
    , clients   = []
    , extSocket = null;

var msgRegex  = /\!\!\@\@\#\#\$\$(.*?)\$\$\#\#\@\@\!\!/gi;

if (cluster.isMaster) {
    var server = net.createServer(function(stream){
        clients.push(stream);
	this.buffer = "";
	stream.setTimeout(0);
	stream.setEncoding('utf8');
        stream.on('data', function(data){
	    var line = this.buffer + data.toString();
	    var done = "";
	    while((messages = msgRegex.exec(line)) != null){
	        done += '!!@@##$$' + messages[1] + '$$##@@!!';
                var command = messages[1].substr(0, 4);
                var data    = messages[1].substr(5);
                var key     = data[0].toUpperCase();
	        var msg = {'command': command, 'data': data, 'client': clients.indexOf(this)};
	        //interpret message, send to worker
	        serverIds[key].send(msg);
	    }
	    this.buffer = line.replace(done, "");
        });

    });
    
    var split = sections.length / threads;
    for (var i = 0; i < threads; i++) {
        var worker = cluster.fork();
	worker.on('message', function(msg){
		clients[msg['client']].write('!!@@##$$' + msg['data'] + '$$##@@!!');
	});
	for(var x=(i*split); x<((i+1) * split); x++){
		serverIds[sections[x]] = worker;
	}
    }
    
    cluster.on('death', function(worker) {
        console.log('worker ' + worker.pid + ' died');
    });
    server.listen('1337', function(){});
} else {
    var dataStore = {};

    process.on('message', function(data){
	var split   = data['data'].indexOf(' ');
	if(split > 0){
	    var id = data['data'].substr(0, split);
	} else {
	    var id = data['data'];	
	}
        var payload = data['data'].substr( split );
	switch(data['command']){
	    case "STOR":
                dataStore[id] = payload;
	        process.send({'data' : 'OK   ' + id, 'client' : data['client']});
	        break;
	    case "RETR":
		if(id in dataStore){
                    process.send({'data' : 'DATA ' + dataStore[id], 'client' : data['client']});
	        } else {
                    process.send({'data' : 'ERRO 0000 KEY NOT FOUND', 'client' : data['client']});
		}
		break;
	    default:
		process.send({'data' : 'ERRO 0000 BAD COMMAND SENT', 'client' : data['client']});
	        break;
	}
    });	    
}
