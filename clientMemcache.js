var net = require('net');
var _   = require('underscore');
var memcache = require('memcache');

var savedData = Array();
var options = Array();
process.argv.forEach(function (val, index, array) {
        options.push(val);
});

function qDebug(msg){
        if(_.indexOf(options, 'debug') != -1){
                console.log(msg);
        }
}

var client = new memcache.Client(11211, "127.0.0.1");
//var data = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae tellus dui, sit amet dignissim libero. Donec eu est ipsum. Nunc non felis mi. Etiam et neque ipsum. Praesent a felis augue. Donec congue, mauris eu ornare tincidunt, risus orci pretium felis, sed varius lorem felis non ante. Nullam ullamcorper pharetra nunc, eget faucibus mauris lobortis sed. Maecenas velit dui, vestibulum in aliquam non, commodo sed elit. Donec tempus, nunc ac congue varius, orci velit cursus nibh, eu vulputate nibh risus quis nulla. In ac arcu nibh, a suscipit leo. Integer nunc enim, porttitor quis molestie vel, feugiat vel eros. Nam et ligula lectus. Aliquam erat volutpat. Aliquam blandit iaculis massa eget congue. Cras molestie, tellus a iaculis dapibus, metus eros consectetur lorem, ut aliquet nibh neque vitae est.	In at lacus sit amet tellus porttitor sodales a vel eros. Sed iaculis lobortis mi, in vehicula sem luctus sed. Aliquam aliquet feugiat ante, non elementum nisl pellentesque eget. Donec sed odio libero, sit amet aliquet tellus. Pellentesque eu nibh elit. Donec odio dui, molestie at venenatis sit amet, viverra in ipsum. Ut ac suscipit enim. Proin sollicitudin facilisis orci, quis interdum sapien fermentum et. Vestibulum dignissim enim in odio venenatis adipiscing eu eget risus. Quisque tempus eros vitae elit tempor ultrices. Duis a imperdiet sapien. Vestibulum dui risus, pretium vel tincidunt in, euismod at dolor. Donec at dui et urna dignissim condimentum. Aliquam diam quam, fringilla eu aliquet et, porttitor quis purus. Donec sagittis, libero vitae bibendum interdum, justo nisi congue mi, eu pretium dolor justo id purus. Curabitur eros arcu, pulvinar quis imperdiet in, lacinia in lacus. Curabitur molestie molestie metus, quis vestibulum erat lobortis nec. Etiam nulla justo, dignissim vulputate pharetra id, porttitor in felis. Etiam porta augue nec ligula varius convallis. Duis nec nunc dolor, a venenatis leo. Phasellus vehicula accumsan dolor, quis sodales felis aliquam eget. Donec pellentesque consequat hendrerit. Phasellus sollicitudin tincidunt consequat. Curabitur id augue nec nunc vehicula dapibus. Integer pulvinar, tellus quis tincidunt tempor, mauris justo tincidunt orci, non lacinia justo ante in dui. Mauris scelerisque erat eu nulla imperdiet a adipiscing massa ultrices. Aliquam erat volutpat. Vivamus et risus ut ante hendrerit posuere vitae eget mi. Proin et risus erat. Mauris dapibus ultricies lorem, ac adipiscing ipsum rhoncus eget. Proin a est nunc. Nunc in urna in ligula imperdiet commodo eget tincidunt arcu. Morbi sit amet purus ante, sit amet sagittis justo. Nam sagittis ligula eu lacus ultrices feugiat.";
var data = "This is some data.";

client.on('close', function() {
	qDebug('client disconnected');
});
client.on('connect', function(){
	var writeStart = Date.now();
	for(var i=0; i < 100000; i++){
		//Store correctly
		var id   = Math.random().toString(36).substring(5);
		savedData.push(id);
		client.set(id, data, function(error, result){});
		qDebug('Storing - ' + id);
	}
	var writeEnd = Date.now();
	var readStart = Date.now();
	for(i in savedData){
		client.get(savedData[i], function(error, result){
			if(result!=data){
				console.log('Inconsistent Data from Server!');
			}
		});
		qDebug('Getting - ' + savedData[i]);
	}
	var readEnd = Date.now();
	
	writeTime = writeEnd - writeStart;
	console.log("Writing took: " + writeTime + "ms");
	readTime = readEnd - readStart;
	console.log("Reading took  " + readTime + "ms");
});

client.connect();
