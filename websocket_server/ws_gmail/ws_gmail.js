var websocket = require('ws');
var http = require("http");
var amqp=require('amqplib/callback_api');
var server = http.createServer(function(req,res){}).listen(8087);
const ws = new websocket.Server({server});
ws.on('connection',function connection(ws){
	console.log('websocket');
	ws.on('message',function(msg){
		console.log(msg);
		var array_1 = msg.split('?');
		var text = array_1[1];
		var array = text.split('/');
		var user = array[0];
		var indirizzo = array[1];
		var citta = array[2];
		var mail = array[3];
		var telefono = array[4];
		var stampantetipo = array[5];
		var stampantenome = array[6];
		var stampanteid = array[7];
		var prezzo = array[8];
		var spedizione = array[9];
		var consegna = array[10];
		var distanza = array[11];
		var session = array[12];
		amqp.connect('amqp://rabbit', function(err, conn) {
				if(!err){
					var queue = 'gmail'+session;
					conn.createChannel(function(err,ch){
						ch.assertQueue(queue,{durable:false,autodelete:true, maxLength:1});
							ch.sendToQueue(queue,new Buffer(msg));
							console.log("Inviato messaggio sulla coda gmail");
						});
					}
				else{
					console.log("Errore nella coda gmail");
				}
			});
		});
	});
