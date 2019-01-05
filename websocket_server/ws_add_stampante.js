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
		if(array_1[0]==="add_stampante"){
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
		}
		else{
			var stampanteid = array_1[1];
			var hash = md5(stampanteid);
			var user_id = "";
			request("http://localhost:5984/printers/"+hash, (err,res,body)=>{
				if(!err){
					if (res.statusCode == 200){
						user_id = JSON.parse(body).varuser;
					}
				}
			});
			var options1 = {
				method: "DELETE",
				path: "/printers/"+hash,
				port: 5984,
				host: "localhost",
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			};
			const richiesta1 = http.request(options1);
			richiesta1.end();
			var varuser = md5(user_id);
			request("http://localhost:5984/users/"+varuser, (err,res,body)=>{
				if(!err){
					if (res.statusCode == 200){
						var utente = JSON.parse(body);
						var index = utente.stampanti.indexOf(hash)
						utente.stampanti.splice(index,1);
						var options = {
							method: "PUT",
							path: "/printers/"+hash,
							port: 5984,
							host: "localhost",
							headers: {
								'Content-Type': 'application/json',
								'Accept': 'application/json',
							},
						};
						const richiesta = http.request(options);
						richiesta.write(JSON.stringify(utente));
						richiesta.end();
					}
				}
			});
			
		}
	});
});

