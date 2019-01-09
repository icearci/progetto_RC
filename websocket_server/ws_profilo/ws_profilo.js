var websocket = require('ws');
var http = require("http");
var bodyparser = require('body-parser');
var md5 = require('md5');
var request = require('request');
var server = http.createServer(function(req,res){}).listen(8084);
const ws = new websocket.Server({server});
console.log('creato il websocket server');
ws.on('connection',function connection(ws){
	ws.on('message',function(msg){
		var array_1 =msg;
		var stampanti;
		console.log(array_1);
		request("http://db:5984/users/"+array_1, (err,res,body)=>{
			if(!err){
				if (res.statusCode == 200){
					ws.send(body);
					console.log(body);
					stampanti = JSON.parse(body).stampanti;
					for(var i = 0;i<stampanti.length;i++){
						request("http://db:5984/printers/"+stampanti[i], (err,res,body)=>{
							ws.send(body);
							console.log(body);
						});
					}
				}
				else{
					ws.send("errore");
				}
			}
		});
		
	});
});

function generate_id(){
	return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
	 }			

