var websocket = require('ws');
var http = require("http");
var md5 = require('md5');
var request = require('request');
var amqp=require('amqplib/callback_api');
var server = http.createServer(function(req,res){}).listen(8085);
const ws = new websocket.Server({server});
console.log('creato il websocket server');

function remove_stampante(stampanteid){
	return new Promise(function(resolve,reject){
		var hash = md5(stampanteid);
			var stampante_body ="";
			console.log(hash);
			request("http://db:5984/printers/"+hash, (err,res,body)=>{
				if(err){
					console.log(err);
					reject(err);
				}
				else{
					if(res.statusCode!=200){
						console.log(res.statusCode);
					}
					else{
						stampante_body = JSON.parse(body);
						resolve(stampante_body);
						var username = stampante_body.varuser;
						console.log("Ottenuto user stampante: "+username);
						var hash_user = md5(username);
						console.log(hash);
						request("http://db:5984/users/"+hash_user, (err,res,body)=>{
						if(err){
							console.log(err);
						}
						else{
							if(res.statusCode!=200){
								console.log(res.statusCode);
							}
							else{
								var utente = JSON.parse(body);
								var index = utente.stampanti.indexOf(hash);
								utente.stampanti.splice(index,1);
								var options1 = {
									method: "PUT",
									path: "/users/"+hash_user,
									port: 5984,
									host: "db",
									headers: {
										'Content-Type': 'application/json',
										'Accept': 'application/json',
									},
								};
								const richiesta1 = http.request(options1);
								richiesta1.write(JSON.stringify(utente));
								richiesta1.end();
							}
						}
					});
				}
			}
		});
	});
}
		
ws.on('connection',function connection(ws){
	ws.on('message',function(msg){
		var array_1 = msg.split('?');
		if(array_1[0]==="add_stampante"){
			var stampanteid = array_1[1];
			var hash = md5(stampanteid);
			request("http://db:5984/printers/"+hash, (err,res,body)=>{
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
			console.log("arrivato un delete di "+array_1[1]);
			var stampanteid = array_1[1];
			var hash = md5(stampanteid);
			var stampante_body = remove_stampante(stampanteid);
			
			stampante_body.then(function(result){
				var stampante_stringa=JSON.stringify(result);
				console.log(stampante_stringa);
				var options = {
					method: "DELETE",
					path: "/printers/"+hash,
					port: 5984,
					host: "db",
					headers: {
						'Accept': 'application/json',
						'If-Match':result._rev
					},
				};
				const richiesta = http.request(options);
				richiesta.write(stampante_stringa);
				richiesta.end();
			},function(err){
				console.log(err)
				});
		}
	});
});
						
							
