var http = require('http');
var websocket = require('ws');
var md5 = require('md5');
var request = require('request');
var amqp=require('amqplib/callback_api');
var server = http.createServer(function(req,res){}).listen(8082);
const ws = new websocket.Server({server});
console.log('creato il websocket server');
ws.on('connection',function connection(ws){
	console.log('websocket');
	ws.on('message',function(msg){
		console.log(msg);
		var array_1 = msg.split('?');
		var text = array_1[1];
		var array = text.split('/');
		var username = array[0];
		var psw = array[1];
		var hash = md5(username);
		console.log(username+' '+psw+' '+hash);
		request('http://db:5984/users/'+hash,(err,res,body)=>{
			var statusCode = res.statusCode;
			var utente = JSON.parse(body);
			var password = utente.password;
			if(statusCode==200){
				console.log(psw+password);
				if(psw===password){
					ws.send('ok');
					console.log('Inviato ok');
				}
				else{
					ws.send('refuse');
					console.log("Inviato refuse");
				}
			}
			else{
				ws.send('refuse');
				console.log("Inviato refuse");
			}
		});
	});
});


