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
var fs = require("fs");
const {google} = require('googleapis');
//const base64url = require('base64url');

app.use(express.static(__dirname));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookie_parser());

var client_id = JSON.parse(fs.readFileSync(path.resolve(__dirname+"/client_id.json")));
var id_oauth = client_id.web.client_id;
var client_secret = client_id.web.client_secret;
const oauth2Client = new google.auth.OAuth2(
  id_oauth,
  client_secret,
  "http://localhost:8080/auth"
);

function oauthAndSend(code,cookie){
	  return new Promise(function(resolve,reject){
		  var formData = {
		code: code,
		client_id: id_oauth,
		client_secret: client_secret,
		redirect_uri: 'http://localhost:8080/redirect',
		grant_type: 'authorization_code'
	  }
	  request.post({url:"https://oauth2.googleapis.com/token", form: formData}, function(err, httpResponse, body) {
		  if(err){
			  console.log("Errore nella richiesta del token");
			  reject(err);
		  }
		  else{
			  if(httpResponse.statusCode!=200){
				  console.log("Richiesta token effettuata, ma errore nel codice: "+httpResponse.statusCode);
			  }
			  else{
				  console.log("Google ha risposto con il token");
				  token = JSON.parse(body).access_token;
				  console.log(token);
				  console.log("L' intera risposta di google: "+body);
				  amqp.connect('amqp://localhost', function (err, conn) {
					  if (!err) {
						  var queue = 'gmail' + cookie;
						  console.log("coda: "+queue);
						  conn.createChannel(function (err, ch) {
							  ch.assertQueue(queue, { durable: false, autodelete: true, maxLength: 1 });
							  ch.consume(queue, (message) => {
								  var messaggio = message.content.toString()
								  console.log(messaggio);
								  var array = messaggio.split("/");
								  request({ uri: "https://www.googleapis.com/gmail/v1/users/me/profile",
										  headers: {
											"Content-Type": "application/json",
											'Authorization': 'Bearer '+token
										  }},function(err,res,body){
										var mail = JSON.parse(body).emailAddress;
										var messaggio = [
										"Ciao, sono interessato ad una delle tue stampanti per un mio nuovo progetto, controlla se le informazioni del tuo account utente (e-mail, telefono, preferenze sul ritiro) sono corrette, altrimenti non potrò contattarti",
										"Nome stampante: "+array[6],
										"ID stampante: "+array[7],
										"Indirizzo: "+array[1],
										"City: "+array[2],
										"Telefono: "+array[4],
										"Prezzo per ora: "+array[8],
										];
										var encoded = messaggio.join("\n").toString("base64");
										const messageParts = [
										'From: <'+mail+'>',
										'To: <'+array[3]+'>',
										'Content-Type: message/rfc822',
										'MIME-Version: 1.0',
										'Subject: ciao',
										'',
										"Content-Type: text/plain; charset='UTF-8'",
										"MIME-Version: 1.0",
										"Content-Transfer-Encoding: base64",
										"",
										encoded,
										];
									const message = messageParts.join('\n');
									const encodedMessage = Buffer.from(message).toString('base64');
									request({
									  method: "POST",
									  uri: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
									  headers: {
										"Content-Type": "application/json",
										'Authorization': 'Bearer '+token
									  },
									  body: "{'raw':"+JSON.stringify(encodedMessage)+"}",
									}, function(error, httpResponse, body) {
									  console.log(body);
									  resolve(1);
									});
								});
							});
						});
					}
				});
			}
		}
	});
});
}


function generaDB(){
	var options = {
		method: "PUT",
		path: "/users",
		port: 5984,
		host: "localhost",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
	};
	const richiesta = http.request(options);
	richiesta.end();
	var options1 = {
		method: "PUT",
		path: "/printers",
		port: 5984,
		host: "localhost",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
	};
	const richiesta1 = http.request(options1);
	richiesta1.end();
}
generaDB();

var pagine_utili = ["/login","/home","/add_stampante","/search","/profilo","/tecnologie","/news","/chi_siamo","/faq","/visore","/gmail"];
function generateUuid() {
	return Math.random().toString() +
		Math.random().toString() +
		Math.random().toString();
}

function settaCookie(res,id){
	for(var i = 0;i<pagine_utili.length;i++){
		res.cookie('id',id,{
							maxAge:1800000,
							path: pagine_utili[i]});
						}
		res.cookie("id",id,{
			domain: "localhost:5000",
			path: "/search",
			maxAge: 1800000
		});
					}
function levaCookie(res){
	for(var i = 0;i<pagine_utili.length;i++){
		res.clearCookie('id',{
							path: pagine_utili[i]});
						}
					}
app.get('/logout',(req,res)=>{
	levaCookie(res)
	res.redirect('http://localhost:8080/login');
});

app.get('/register', (req, res) => {
	var id = req.cookies.id;
	console.log(id);
	if (id == undefined) {
		console.log('settato a zero il cookie');
		res.sendFile(path.resolve(__dirname + "/html/paginaRegistrati/login.html"));
	}
	else {
		res.redirect('/home');
	}
});

app.get('/profilo', (req, res) => {
	var id = req.cookies.id;
	console.log(id);
	if (id != undefined) {
		console.log('La home nota che il cookie è già settato');
		res.sendFile(path.resolve(__dirname + "/html/paginaProfilo/Profilo.html"));
	}
	else if (id == undefined) {
		res.sendFile(path.resolve(__dirname + "/html/paginaRegistrati/login.html"));
	}

});
app.get("/news",(req,res)=>{
	res.sendFile(path.resolve(__dirname+"/html/paginaNews/news.html"));
});
app.get("/chi_siamo",(req,res)=>{
	res.sendFile(path.resolve(__dirname+"/html/paginaChiSiamo/chi_siamonew.html"));
});
app.get("/faq",(req,res)=>{
	res.sendFile(path.resolve(__dirname+"/html/paginaFAQ/Faq.html"));
});
app.get("/visore",(req,res)=>{
	res.sendFile(path.resolve(__dirname+"/html/visore3d/visore_mio.html"));
});
app.get("/tecnologie",(req,res)=>{
	res.sendFile(path.resolve(__dirname+"/html/paginaTecnologie/tecnologie.html"));
});

app.get('/login', (req, res) => {
	console.log('ciao');
	var id = req.cookies.id;
	console.log(id);
	if (id == undefined) {
		console.log('settato a zero il cookie');
		res.sendFile(path.resolve(__dirname + "/html/paginaRegistrati/login.html"));
	}
	else {
		res.redirect('/home');
	}
});

app.get('/home', (req, res) => {
	res.sendFile(path.resolve(__dirname + "/html/paginaHome.3/homenew.html"));
});

app.get('/search', (req, res) => {
	if(req.cookies.id==undefined){
		res.redirect("/login");
	}
	else{
	res.set({ "Content-Type": "text/html" });
	res.sendFile(path.resolve(__dirname + "/html/paginaRicerca/ricercanew.html"));
}
});

app.get("/add_stampante", (req, res) => {
	if (req.cookies.id == undefined) {
		res.redirect('/login');
	}
	else {
		res.set({ 'Content-Type': 'text/html' });
		res.sendFile(path.resolve(__dirname + "/html/paginaImmissione/immissionenew.html"));
	}

});

app.get("/gmail",(req,res)=>{
	var cookie = req.cookies.id;
	res.cookie("id",cookie);
	res.redirect("https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send&response_type=code&approval_prompt=force&redirect_uri=http%3A%2F%2Flocalhost:8080/redirect&client_id="+id_oauth);
	
});

app.get("/redirect",(req,res)=>{
	var redirigi=0;
	var code = req.query.code;
	var cookie = req.cookies.id;
	var inizializza = oauthAndSend(code,cookie);
	inizializza.then(function(result){
		if(result==1){
			res.redirect("/home");
		}
		else{
			res.send(result);
		}
	});
});

/*app.get("/redirect",(req,res)=>{
	var redirigi=0;
	var code = req.query.code;
	var formData = {
		code: req.query.code,
		client_id: id_oauth,
		client_secret: client_secret,
		redirect_uri: 'http://localhost:8080/redirect',
		grant_type: 'authorization_code'
	  }
	  
	  request.post({url:"https://oauth2.googleapis.com/token", form: formData}, function(err, httpResponse, body) {
		  if(err){
			  console.log("Errore nella richiesta del token");
		  }
		  else{
			  if(httpResponse.statusCode!=200){
				  console.log("Richiesta token effettuata, ma errore nel codice: "+httpResponse.statusCode);
			  }
			  else{
				  console.log("Google ha risposto con il token");
				  token = JSON.parse(body).access_token;
				  console.log(token);
				  console.log("L' intera risposta di google: "+body);
				  amqp.connect('amqp://localhost', function (err, conn) {
					  if (!err) {
						  var queue = 'gmail' + req.cookies.id;
						  console.log("coda: "+queue);
						  conn.createChannel(function (err, ch) {
							  ch.assertQueue(queue, { durable: false, autodelete: true, maxLength: 1 });
							  ch.consume(queue, (message) => {
								  var messaggio = message.content.toString()
								  console.log(messaggio);
								  var array = messaggio.split("/");
								  request({ uri: "https://www.googleapis.com/gmail/v1/users/me/profile",
										  headers: {
											"Content-Type": "application/json",
											'Authorization': 'Bearer '+token
										  }},function(err,res,body){
										var mail = JSON.parse(body).emailAddress;
										var messaggio = [
										"Ciao, sono interessato ad una delle tue stampanti per un mio nuovo progetto, controlla se le informazioni del tuo account utente (e-mail, telefono, preferenze sul ritiro) sono corrette, altrimenti non potrò contattarti",
										"Nome stampante: "+array[6],
										"ID stampante: "+array[7],
										"Indirizzo: "+array[1],
										"City: "+array[2],
										"Telefono: "+array[4],
										"Prezzo per ora: "+array[8],
										];
										var encoded = messaggio.join("\n").toString("base64");
										const messageParts = [
										'From: <'+mail+'>',
										'To: <'+array[3]+'>',
										'Content-Type: message/rfc822',
										'MIME-Version: 1.0',
										'Subject: ciao',
										'',
										"Content-Type: text/plain; charset='UTF-8'",
										"MIME-Version: 1.0",
										"Content-Transfer-Encoding: base64",
										"",
										encoded,
										];
									const message = messageParts.join('\n');
									const encodedMessage = Buffer.from(message).toString('base64');
									request({
									  method: "POST",
									  uri: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
									  headers: {
										"Content-Type": "application/json",
										'Authorization': 'Bearer '+token
									  },
									  body: "{'raw':"+JSON.stringify(encodedMessage)+"}",
									}, function(error, httpResponse, body) {
									  console.log(body);
									});
									redirigi=1;
								});
							});
						});
					}
				});
			}
		}
	});
});*/

app.post("/add_stampante", (req, res) => {
	var user_id = req.cookies.id;
	console.log("id trovato in add_stampante " + user_id);
	if (user_id === md5(req.body.varuser)) {
		var stampante = {
			varuser:req.body.varuser,
			varindirizzo:req.body.varindirizzo,
			varcitta:req.body.varcitta,
			varprovincia:req.body.varprovincia,
			varpaese:req.body.varpaese,
			varcap:req.body.varcap,
			varemail:req.body.varemail,
			vartelefono:req.body.vartelefono,
			stampantetipo:req.body.stampantetipo,
			stampantenome:req.body.stampantenome,
			stampanteid:req.body.stampanteid,
			stampanteprezzo:req.body.stampanteprezzo,
			varspedizione: req.body.varspedizione,
			varconsegna:req.body.varconsegna,
		};
		var hash = md5(stampante.stampanteid);
		var options = {
			method: "PUT",
			path: "/printers/" + hash,
			port: 5984,
			host: "localhost",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		};
		const richiesta = http.request(options);
		richiesta.write(JSON.stringify(stampante));
		richiesta.end();
		request("http://localhost:5984/users/" + user_id, (err, res, body) => {
			var utente = JSON.parse(body);
			delete utente["_id"];
			console.log("Sto per eseguire la push");
			utente.stampanti.push(hash);
			console.log(utente);
			var options1 = {
				method: "PUT",
				path: "/users/" + user_id,
				port: 5984,
				host: "localhost",
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			};
			console.log(user_id);

			var update = JSON.stringify(utente);
			const richiesta1 = http.request(options1);
			richiesta1.write(update);
			richiesta1.end();
			console.log(update);
		});
		res.redirect("/home"); /*o redirigiamo verso il profilo aggiornato (Stef)*/
	}
	else {
		res.send("<h1>Non sei loggato con l' utente corretto!</h1>");
	}
});

app.post("/register", (req, res) => {
	var username_ = req.body.username_registrazione;
	var fullname = req.body.fullname;
	var telephone = req.body.telephone;
	console.log(username_);
	var password_ = req.body.password_registrazione;
	var mail_ = req.body.mail_registrazione;
	var hash = md5(username_);
	var utente = {
		fullname: fullname,
		username: username_,
		password: password_,
		mail: mail_,
		telephone: telephone,
		stampanti: [],
	};
	var options = {
		method: "PUT",
		path: "/users/" + hash,
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
	res.redirect("/login");
});

app.post('/login', (req, res) => {
	var id;
	var utente = req.body.username_login;
	var id_coda = md5(utente);
	console.log(id_coda);
	console.log(utente);
	amqp.connect('amqp://localhost', function (err, conn) {
		if (!err) {
			console.log('Connected to rabbit');
			console.log(utente);
			var queue = 'login' + utente;
			conn.createChannel(function (err, ch) {
				ch.assertQueue(queue, { durable: false, autodelete: true, maxLength: 1 });
				ch.consume(queue, (message) => {
					var messaggio = message.content.toString()
					if (messaggio === "ok") {
						console.log('Sto per settare il cookie');
						settaCookie(res, id_coda);
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
