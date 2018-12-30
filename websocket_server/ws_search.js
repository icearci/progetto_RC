//listen 8084?
var http = require('http');
var websocket = require('ws');
var request = require('request');
var amqp=require('amqplib/callback_api');
var server = http.createServer(function(req,res){}).listen(8084);
const ws = new websocket.Server({server});
console.log('creato il websocket server');
ws.on('connection',function connection(ws){
	console.log('websocket_search');
	ws.on('message',function(msg){
		console.log(msg);
		
        var arr_query = msg.split('/');
        var city = arr_query[0];
        var tollerance = arr_query[1];
        var price = arr_query[2];
        var printer = arr_query[3];
        var expedition = arr_query[4];
            
        console.log(city+' '+tollerance+' '+price+' '+ printer +' ' + expedition);
        ws.send('ok');
		// request('http://localhost:5984/users/'+hash,(err,res,body)=>{
		// 	var statusCode = res.statusCode;
		// 	var utente = JSON.parse(body);
		// 	var password = utente.password;
			
		// 	console.log(password);
		// 	amqp.connect('amqp://localhost', function(err, conn) {
		// 		if(!err){
		// 			console.log("Status Code "+statusCode);
		// 			console.log('Connected to rabbit');
		// 			console.log(username);
		// 			var queue = 'login'+username;
		// 			conn.createChannel(function(err,ch){
		// 				ch.assertQueue(queue,{durable:false,autodelete:true, maxLength:1});
		// 				if(statusCode==200){
		// 					console.log(psw+password);
		// 					if(psw===password){
		// 						ch.sendToQueue(queue, new Buffer('ok'));
		// 						ws.send('ok');
		// 						console.log('Inviato ok');
		// 					}
		// 					else{
		// 						ch.sendToQueue(queue, new Buffer('refuse'));
		// 						ws.send('refuse');
		// 						console.log("Inviato refuse");
		// 					}
		// 				}
		// 				else{
		// 					ch.sendToQueue(queue, new Buffer('refuse'));
		// 					ws.send('refuse');
		// 					console.log("Inviato refuse");
		// 				}
		// 			});
		// 		}
		// 	});
		// });
	});
});