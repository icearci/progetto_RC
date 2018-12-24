var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var request = require('request');
var md5 = require('md5');
const websocket = require('ws');
var http = require('http');
var path = require('path');
var amqp = require('amqplib/callback_api');
var cookie_parser = require('cookie-parser');

app.use(express.static(__dirname));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(cookie_parser());

app.get('/logout',(req,res)=>{
	res.clearCookie('id',{
		path:'/login'});
	res.clearCookie('id',{
		path:'/home'});
	res.redirect('http://localhost:8080/login');
});

app.get('/register',(req,res)=>{
	var id = req.cookies.id;
	console.log(id);
	if(id == undefined){
		console.log('settato a zero il cookie');
		res.sendFile(path.resolve(__dirname+"/html/paginaRegistrati/login.html"));
	}
	else{
		res.redirect('/home');
	}
});
	
app.get('/login',(req,res)=>{
	console.log('ciao');
	var id = req.cookies.id;
	console.log(id);
	if(id == undefined){
		console.log('settato a zero il cookie');
		res.sendFile(path.resolve(__dirname+"/html/paginaRegistrati/login.html"));
	}
	else{
		res.redirect('/home');
	}
});

app.get('/home',(req,res)=>{
	var id = req.cookies.id;
	console.log(id);
	if(id != undefined){
		console.log('La home nota che il cookie è già settato');
		res.sendFile(path.resolve(__dirname+"/html/paginaHome.3/homenew.html"));
	}
	else if(id == undefined){
		res.sendFile(path.resolve(__dirname+"/html/paginaHome.3/homenew_sloggato.html"));
	}
	
});
app.post("/register",(req,res)=>{
	var username_ = req.body.username_registrazione;
	console.log(username_);
	var password_ = req.body.password_registrazione;
	var mail_ = req.body.mail_registrazione;
	var hash = md5(username_);
	var utente = {
		username: username_,
		password: password_,
		mail: mail_,
	};
	var options = {
		method: "PUT",
		path: "/users/"+hash,
		port: 5984,
		host: "localhost",
		headers:{
			'Content-Type':'application/json',
			'Accept':'application/json',
				},
		};
	const richiesta = http.request(options);
	richiesta.write(JSON.stringify(utente));
	richiesta.end();
	res.cookie('id',hash,{
		maxAge: 20000,
		path: "/login"});
		res.cookie('id',hash,{
		maxAge: 20000,
		path: "/home"});
	res.redirect("/login");
});

app.get('/profilo',(req,res)=>{
	var id = req.cookies.id;
	console.log(id);
	if(id != undefined){
		console.log('La home nota che il cookie è già settato');
		res.sendFile(path.resolve(__dirname+"/html/paginaProfilo/Profilo.html"));
	}
	else if(id == undefined){
		res.sendFile(path.resolve(__dirname+"/html/paginaRegistrati/login.html"));
	}
	
});


app.post('/login',(req,res)=>{
	var id;
	var utente = req.body.username_login;
	var id_coda = md5(utente);
	console.log(id_coda);
	console.log(utente);
	amqp.connect('amqp://localhost', function(err, conn) {
		if(!err){
			console.log('Connected to rabbit');
			console.log(utente);
			var queue = 'login'+utente;
			conn.createChannel(function(err,ch){
				ch.assertQueue(queue,{durable:false, autodelete:true, maxLength:1});
				ch.consume(queue,(message)=>{
					var messaggio = message.content.toString()
					if(messaggio === "ok"){
						console.log('Sto per settare il cookie');
						res.cookie('id',id_coda,{
							maxAge:20000,
							path: '/login',});
							console.log('Sto per settare il cookie login');
						res.cookie('id',id_coda,{
							maxAge:20000,
							path: '/home'});
						res.cookie('id',id_coda,{
							maxAge:20000,
							path: '/profilo'});
							console.log('Sto per settare il cookie home');
							console.log('Sto per redirigere');
						ch.close();
						res.redirect('/home');
						}
				});
			});
		}
	});
});
app.listen(8080);
