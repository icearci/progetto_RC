var websocket = require('ws');
var http = require("http");
var bodyparser = require('body-parser');
var md5 = require('md5');
var request = require('request');
var amqp=require('amqplib/callback_api');
var server = http.createServer(function(req,res){}).listen(8084);
const ws = new websocket.Server({server});
console.log('creato il websocket server');
ws.on('connection',function connection(ws){
	ws.on('message',function(msg){
		var array_1 =msg.substring(3);
		console.log(array_1);
		request("http://localhost:5984/users/"+array_1, (err,res,body)=>{
			if(!err){
				if (res.statusCode == 200){
					ws.send(body);
					console.log(body);
				}
				else{
					ws.send("errore");
				}
			}
		});
		amqp.connect('amqp://localhost', function(err, conn) {
			if(!err){
				//console.log("Status Code "+statusCode);
				console.log('Connected to rabbit');
				var invia='invia';
				var ricevi='ricevi';
				var id=generate_id();
				conn.createChannel(function(err,ch){
					ch.assertQueue(invia,{durable:true});
					ch.assertQueue(ricevi,{durable:true});
					ch.sendToQueue(invia, new Buffer(array_1),{correlationId:id,replyTo: ch.queue});
					var t;
					ch.consume(ricevi, function(msg) {
						t=msg.content.toString();
						console.log(t);
						ws.send(t);
					});
					//setTimeout(function() { conn.close(); process.exit(0) }, 500);
					ch.consume(ricevi, function(msg) {
						t=msg.content.toString();
						console.log(t);
					//setTimeout(function() { conn.close(); process.exit(0) }, 500);
						var len=parseInt(t);
						console.log(len);
						for(c=0; c<len;c++){
							console.log('entrati');
							ch.consume(ricevi, function(msg) {
								t=msg.content.toString();
								console.log(t);
						//setTimeout(function() { conn.close(); process.exit(0) }, 500);
								request("http://localhost:5984/users/"+t, (err,res,body)=>{
									if(!err){
										if (res.statusCode == 200){
											ws.send(body);
											console.log(body);
											}
									else{
										ws.send("errore");
										}
									}
								});
							});
						}
					});
				});		
			}	
		});
	});
});

function generate_id(){
	return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
	 }			

