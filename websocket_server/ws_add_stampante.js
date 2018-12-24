var websocket = require('ws');
var http = require("http");
var md5 = require('md5');
var request = require('request');
var amqp=require('amqplib/callback_api');
var server = http.createServer(function(req,res){}).listen(8085);
const ws = new websocket.Server({server});
console.log('creato il websocket server');
ws.on('connection',function connection(ws){
	ws.on('message',function(msg){
		var array_1 = msg.split('?');
		var stampanteid = array_1[1];
		var hash = md5(stampanteid);
		request("http://localhost:5984/printers/"+hash, (err,res,body)=>{
			if(!err){
				if (res.statusCode == 200){
					ws.send("refuse");
				}
				else{
					ws.send("ok");
				}
			}
		});
	});
});

