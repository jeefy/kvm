var net  = require('net');
var _    = require('underscore');
var mesg = require('./message.js');
var storedData   = Array();
var options      = Array();
var writeStart   = null;
var readEnd      = null;
var readStart    = null;
var lastRecord   = null;
var resultsCount = 0;
var buffer       = ""
var msgRegex     = /\!\!\@\@\#\#\$\$(.*?)\$\$\#\#\@\@\!\!/gi;
var count      = 0;
var doneCount  = 0;
var testLength = 100000;

process.argv.forEach(function (val, index, array) {
        options.push(val);
});

function qDebug(msg){
        if(_.indexOf(options, 'debug') != -1){
                console.log(msg);
        }
}

//var data = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae tellus dui, sit amet dignissim libero. Donec eu est ipsum. Nunc non felis mi. Etiam et neque ipsum. Praesent a felis augue. Donec congue, mauris eu ornare tincidunt, risus orci pretium felis, sed varius lorem felis non ante. Nullam ullamcorper pharetra nunc, eget faucibus mauris lobortis sed. Maecenas velit dui, vestibulum in aliquam non, commodo sed elit. Donec tempus, nunc ac congue varius, orci velit cursus nibh, eu vulputate nibh risus quis nulla. In ac arcu nibh, a suscipit leo. Integer nunc enim, porttitor quis molestie vel, feugiat vel eros. Nam et ligula lectus. Aliquam erat volutpat. Aliquam blandit iaculis massa eget congue. Cras molestie, tellus a iaculis dapibus, metus eros consectetur lorem, ut aliquet nibh neque vitae est.	In at lacus sit amet tellus porttitor sodales a vel eros. Sed iaculis lobortis mi, in vehicula sem luctus sed. Aliquam aliquet feugiat ante, non elementum nisl pellentesque eget. Donec sed odio libero, sit amet aliquet tellus. Pellentesque eu nibh elit. Donec odio dui, molestie at venenatis sit amet, viverra in ipsum. Ut ac suscipit enim. Proin sollicitudin facilisis orci, quis interdum sapien fermentum et. Vestibulum dignissim enim in odio venenatis adipiscing eu eget risus. Quisque tempus eros vitae elit tempor ultrices. Duis a imperdiet sapien. Vestibulum dui risus, pretium vel tincidunt in, euismod at dolor. Donec at dui et urna dignissim condimentum. Aliquam diam quam, fringilla eu aliquet et, porttitor quis purus. Donec sagittis, libero vitae bibendum interdum, justo nisi congue mi, eu pretium dolor justo id purus. Curabitur eros arcu, pulvinar quis imperdiet in, lacinia in lacus. Curabitur molestie molestie metus, quis vestibulum erat lobortis nec. Etiam nulla justo, dignissim vulputate pharetra id, porttitor in felis. Etiam porta augue nec ligula varius convallis. Duis nec nunc dolor, a venenatis leo. Phasellus vehicula accumsan dolor, quis sodales felis aliquam eget. Donec pellentesque consequat hendrerit. Phasellus sollicitudin tincidunt consequat. Curabitur id augue nec nunc vehicula dapibus. Integer pulvinar, tellus quis tincidunt tempor, mauris justo tincidunt orci, non lacinia justo ante in dui. Mauris scelerisque erat eu nulla imperdiet a adipiscing massa ultrices. Aliquam erat volutpat. Vivamus et risus ut ante hendrerit posuere vitae eget mi. Proin et risus erat. Mauris dapibus ultricies lorem, ac adipiscing ipsum rhoncus eget. Proin a est nunc. Nunc in urna in ligula imperdiet commodo eget tincidunt arcu. Morbi sit amet purus ante, sit amet sagittis justo. Nam sagittis ligula eu lacus ultrices feugiat.";

var data       = "This is some data.";
var client = net.connect({port: 1337},
	function() { //'connect' listener
		this.buffer = "";	
		qDebug('client connected');
	}
);
client.on('data', function(response) {
	var line = this.buffer + response.toString();
	var done = "";
	qDebug('Data received from Server');
        while((messages = msgRegex.exec(line)) != null){
		done += "!!@@##$$" + messages[1] + "$$##@@!!";
		try{
			command = messages[1].substr(0, 4);
			content = messages[1].substr(5);
			if(command == "OK  "){
				doneCount++;
				if(doneCount==testLength){
					var writeEnd = Date.now();
					console.log('Writing took: ' + (writeEnd - writeStart) + 'ms');
					readStart = Date.now();
					for(i in storedData){
						client.write('!!@@##$$RETR ' + storedData[i] + '$$##@@!!');
					}
				}
			}
			else if(command == "DATA"){
				var x   = content.indexOf(" ");
				var key = content.substr(0, x);
				var val = content.substr(x+1);
				if(val != data){
					console.log('Bad data sent from server');
				}
			} else {
				console.log('Bad command sent.');
				console.log(messages[1]);
			}
		} catch(err){
			console.log('Error parsing sent messages');
			console.log('---');
			console.log(err);
			console.log('---');
		}
		count++;
	}
	this.buffer = line.replace(done, "");
/*	console.log('Messages received: ' + count);
	console.log('Command: ' + command + ' Content: ' + content);
	console.log('Buffer: ' + buffer);*/
	if(count == testLength){
		readEnd = Date.now();
		console.log('Reading took: ' + (readEnd - readStart) + 'ms');
	}
});
client.on('end', function() {
	qDebug('client disconnected');
});
client.on('connect', function(){
	writeStart = Date.now();
	for(var i=0; i < testLength; i++){
		//Store correctly
		var id   = Math.random().toString(36).substring(5);
		client.write('!!@@##$$STOR ' + id  + ' ' + data + '$$##@@!!');
		storedData.push(id);
		qDebug('Storing - ' + i);
	}
});
