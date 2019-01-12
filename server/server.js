var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var request = require('request');
var md5 = require('md5');
var http = require('http');
var path = require('path');
var amqp = require('amqplib/callback_api');
var cookie_parser = require('cookie-parser');
var fs = require("fs");

app.use(express.static(__dirname));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookie_parser());

var client_id = JSON.parse(fs.readFileSync(path.resolve(__dirname+"/client_id.json")));
var id_oauth = client_id.web.client_id;
var client_secret = client_id.web.client_secret;

var test={
	"1":{
		registrazione: {
			fullname: "Leonardo Salustri",
			username: "leo.salu",
			password: "progettorc",
			mail: "leo.salu97@gmail.com",
			telephone: "3771191742",
			stampanti:[]
		},
		aggiungiStampante: {
			"1":{
				varuser: "leo.salu",
				varindirizzo: "via polonia 198",
				varcitta: "Pomezia",
				varprovincia: "RM",
				varpaese: "IT",
				varcap: "00071",
				varemail: "leo.salu97@gmail.com",
				vartelefono: "3771191742",
				stampantetipo: "fdm_professionale",
				stampantenome: "Prima Stampante",
				stampanteid: "AZXFFT567",
				stampanteprezzo: "12",
				varspedizione: "si",
				varconsegna: "si"
			},
			"2":{
			varuser: "leo.salu",
				varindirizzo: "via Ovidio 45",
				varcitta: "Pomezia",
				varprovincia: "RM",
				varpaese: "IT",
				varcap: "00071",
				varemail: "leo.salu97@gmail.com",
				vartelefono: "3771191742",
				stampantetipo: "fdm_professionale",
				stampantenome: "Seconda",
				stampanteid: "EZXHFG56",
				stampanteprezzo: "13",
				varspedizione: "si",
				varconsegna: "si"
			}
		}
	},
	"2":{
		registrazione: {
			fullname: "Alessandra Cenci",
			username: "cenci.ale",
			password: "progettorc",
			mail: "cenci.ale@alice.it",
			telephone: "3771191742",
			stampanti: []
		},
		aggiungiStampante: {
			"1":{
				varuser: "cenci.ale",
				varindirizzo: "via polonia 198",
				varcitta: "Pomezia",
				varprovincia: "RM",
				varpaese: "IT",
				varcap: "00071",
				varemail: "cenci.ale@alice.it",
				vartelefono: "3771191742",
				stampantetipo: "fdm_amatoriale",
				stampantenome: "Prima",
				stampanteid: "BZXHFG56",
				stampanteprezzo: "10",
				varspedizione: "no",
				varconsegna: "si"
			},
			"2":{
				varuser: "cenci.ale",
				varindirizzo: "via polonia 198",
				varcitta: "Pomezia",
				varprovincia: "RM",
				varpaese: "IT",
				varcap: "00071",
				varemail: "cenci.ale@alice.it",
				vartelefono: "3771191742",
				stampantetipo: "fdm_professionale",
				stampantenome: "Prima",
				stampanteid: "DZXHFG56",
				stampanteprezzo: "12",
				varspedizione: "si",
				varconsegna: "si"
			}
				
		}
	},
	"3":{
		registrazione: {
			fullname: "progettorc",
			username: "progettorc",
			password: "progettorc",
			mail: "progettorc2018@gmail.com",
			telephone: "3771191742",
			stampanti: []
		},
		aggiungiStampante: {
			"1":{
				varuser: "progettorc",
				varindirizzo: "Via di Tor San Giovanni 193",
				varcitta: "Roma",
				varprovincia: "RM",
				varpaese: "IT",
				varcap: "00139",
				varemail: "progettorc2018@gmail.com",
				vartelefono: "3771191742",
				stampantetipo: "fdm_professionale",
				stampantenome: "Prima",
				stampanteid: "CZXHFG56",
				stampanteprezzo: "9",
				varspedizione: "no",
				varconsegna: "si"
			},
			"2":{
				varuser: "progettorc",
				varindirizzo: "Via Gran Bretagna 18",
				varcitta: "Pomezia",
				varprovincia: "RM",
				varpaese: "IT",
				varcap: "00071",
				varemail: "progettorc2018@gmail.com",
				vartelefono: "3771191742",
				stampantetipo: "fdm_professionale",
				stampantenome: "Prima",
				stampanteid: "FZXHFG56",
				stampanteprezzo: "10",
				varspedizione: "si",
				varconsegna: "si"
			}
		}
	}
}

/*dopo aver rediretto il fruitore del servizio in /redirect viene chiamata oauthAndSend per richiedere il token e inviare l' email (asincronia gestita con il costrutto Promise --> then)*/
function oauthAndSend(code,cookie){
	  return new Promise(function(resolve,reject){
		  var formData = {
		code: code,
		client_id: id_oauth,
		client_secret: client_secret,
		redirect_uri: 'https://localhost:4443/redirect',
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
				  amqp.connect('amqp://rabbit', function (err, conn) {
					  if (!err) {
						  var queue = 'gmail' + cookie;
						  console.log("coda: "+queue);
						  conn.createChannel(function (err, ch) {
							  ch.assertQueue(queue, { durable: false, autodelete: true, maxLength: 1 });
							  ch.consume(queue, (message) => {
								  var messaggio = message.content.toString()
								  console.log(messaggio);
								  var array = messaggio.split("/");
								  ch.close();
								  request({ uri: "https://www.googleapis.com/gmail/v1/users/me/profile",
										  headers: {
											"Content-Type": "application/json",
											'Authorization': 'Bearer '+token
										  }},function(err,res,body){
										var mail = JSON.parse(body).emailAddress;
										var messaggio = [
										"Ciao, sono interessato ad una delle tue stampanti per un mio nuovo progetto, controlla se le informazioni del tuo account utente (e-mail, telefono, preferenze sul ritiro) sono corrette, altrimenti non potro' contattarti<br>",
										"Nome stampante: "+array[6]+"<br>",
										"Tipo stampante: "+array[5]+"<br>",
										"ID stampante: "+array[7]+"<br>",
										"Indirizzo: "+array[1]+"<br>",
										"Citta': "+array[2]+"<br>",
										"Telefono: "+array[4]+"<br>",
										"Prezzo per ora: "+array[8]+"<br>",
										"Spedizione: "+array[9]+"<br>",
										"Consegna a mano: "+array[10]+"<br>",
										"Per controllare le tue stampanti clicca <a href='https://localhost:4443/login'>qui</a>",
										];
										var encoded = messaggio.join("\n");
										const messageParts = [
										'From: <'+mail+'>',
										'To: <'+array[3]+'>',
										'Subject: Notifica interesse, Printable of Things',
										'MIME-Version: 1.0',
										'Content-Type: text/html',
										"Content-Transfer-Encoding: base64",
										'',
										encoded,
										];
									const message = messageParts.join('\n');
									const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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
function registra_test(){
	return new Promise((resolve,reject)=>{
		try{
		for(var i=1;i<=3;i++){
		var options = {
			method:"PUT",
			host:"db",
			port:5984,
			headers:{
				"Content-Type":"application/json"
			},
			path:"/users/"+md5(test[i.toString()].registrazione.username)
		}
		console.log("registro:"+JSON.stringify(test[i.toString()].registrazione));
		const richiesta = http.request(options);
		richiesta.write(JSON.stringify(test[i.toString()].registrazione));
		richiesta.end();
		console.log("registrato");
	}
	console.log("finita registrazione");
	resolve(1);
}catch(err){
	reject(err);
}
});
	
}
function aggiungi_stampanti_test(){
	return new Promise((resolve,reject)=>{
		try{
		for(var h=1;h<=3;h++){
			for (var c=1;c<=2;c++){
				var hash = md5(test[h.toString()].aggiungiStampante[c.toString()].stampanteid);
				var options1 = {
					method:"PUT",
					host:"db",
					port:5984,
					headers:{
						"Content-Type":"application/json"
					},
					path:"/printers/"+hash
				}
				const richiesta1 = http.request(options1);
				richiesta1.write(JSON.stringify(test[h.toString()].aggiungiStampante[c.toString()]));
				richiesta1.end();
			}
}
resolve(1);
}catch(err){
	reject(err);
}
});
}

function effettua_push(user_id,stampanti){
	return new Promise((resolve,reject)=>{
		try{
		request("http://db:5984/users/" + user_id, (err, res, body) => {
				var utente = JSON.parse(body);
					for(var c=1;c<=2;c++){
					var hash = md5(stampanti[c.toString()].stampanteid);
					console.log("Voglio pushare " +stampanti[c.toString()].stampanteid);
					console.log(body);
					delete utente["_id"];
					console.log("Sto per eseguire la push");
					utente.stampanti.push(hash);
					console.log(utente);
				}
					var options1 = {
						method: "PUT",
						path: "/users/" + user_id,
						port: 5984,
						host: "db",
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
				
			});
		resolve(1);
		}catch(err){
			reject(err);
		}
	});
}

function aggiungi_stampanti_user(){
	for(var h=1;h<=3;h++){
		var user_id = md5(test[h.toString()].registrazione.username);
		var stampanti = test[h.toString()].aggiungiStampante;
		console.log("cerco per l' utente: "+user_id);
		effettua_push(user_id,stampanti).then((result)=>{
			console.log(result);
		});
	}
}

	
function generaDB(){
	return new Promise((resolve,reject)=>{
		try{
	var options = {
		uri: "http://db:5984/users",
		method:"PUT"
	};
	request(options,function(err,res,body){
		var options1 = {
			uri: "http://db:5984/printers",
			method:"PUT"
		};
		request(options1,function(err,res,body){
			resolve(1);
		});
	});
	
}catch(err){
	reject(err);
}
	
});
}

function generateUuid() {
	return Math.random().toString() +
		Math.random().toString() +
		Math.random().toString();
}

function settaCookie(res,id){
	for(var i = 0;i<pagine_utili.length;i++){
		res.cookie('id',id,{
							maxAge:1200000,
							path: pagine_utili[i]});
						}
		res.cookie("id",id,{
			path: "/python_search",
			maxAge: 1200000
		});
					}
function levaCookie(res){
	for(var i = 0;i<pagine_utili.length;i++){
		res.clearCookie('id',{
							path: pagine_utili[i]});
						}
		res.clearCookie("id",{
							path: "/python_search"
						});
					}

/*generazione casi test nel database*/

generaDB().then(function(result){
	if(result==1){
		registra_test().then(function(result){
			if(result==1){
				aggiungi_stampanti_test().then(function(result){
					if(result==1){
						setTimeout(aggiungi_stampanti_user,1000);
					}
				});
			}
		});
	}
});


var pagine_utili = ["/","/login","/home","/add_stampante","/search","/profilo","/tecnologie","/news","/chi_siamo","/faq","/gmail","/redirect"];
/*inizio dispaching delle pagine html*/

app.get('/logout',(req,res)=>{
	for(var i = 0;i<pagine_utili.length;i++){
		res.clearCookie('id',{
							path: pagine_utili[i]});
						}
		res.clearCookie("id",{
							path: "/python_search"
						});
	res.redirect('/login');
});

app.get('/register', (req, res) => {
	var id = req.cookies.id;
	console.log(id);
	if (id == undefined) {
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
	var id = req.cookies.id;
	console.log(id);
	if (id == undefined) {
		res.sendFile(path.resolve(__dirname + "/html/paginaRegistrati/login.html"));
	}
	else {
		res.redirect('/home');
	}
});
app.get("/",(req,res)=>{
	res.redirect("/home");
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
	res.redirect("https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send&response_type=code&approval_prompt=force&redirect_uri=https%3A%2F%2Flocalhost:4443%2Fredirect&client_id="+id_oauth);
	
});

app.get("/redirect",(req,res)=>{
	var redirigi=0;
	var code = req.query.code;
	var cookie = req.cookies.id;
	var inizializza = oauthAndSend(code,cookie);
	inizializza.then(function(result){
		if(result==1){
			res.redirect('https://localhost:4443/home');
		}
		else{
			res.send(result);
		}
	});
});

/*viene aggiunta una stampante a /printers e anche all' array di stampanti dell' utente corrispondente*/
app.post("/add_stampante", (req, res) => {
	var user_id = req.cookies.id;
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
			host: "db",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		};
		const richiesta = http.request(options);
		richiesta.write(JSON.stringify(stampante));
		richiesta.end();
		request("http://db:5984/users/" + user_id, (err, res, body) => {
			var utente = JSON.parse(body);
			delete utente["_id"];
			console.log("Sto per eseguire la push");
			utente.stampanti.push(hash);
			console.log(utente);
			var options1 = {
				method: "PUT",
				path: "/users/" + user_id,
				port: 5984,
				host: "db",
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
		res.redirect('https://localhost:4443/home'); 
	}
	else {
		res.sendFile(path.resolve(__dirname+"/html/paginaImmissione/utente_scorretto.html"));
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
		host: "db",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
	};
	const richiesta = http.request(options);
	richiesta.write(JSON.stringify(utente));
	richiesta.end();
	settaCookie(res,hash);
	res.redirect('https://localhost:4443/home');
});

app.post('/login', (req, res) => {
	var id;
	var utente = req.body.username_login;
	var id_coda = md5(utente);
	console.log(id_coda);
	console.log(utente);
	settaCookie(res, id_coda);
	console.log('Sto per settare il cookie home');
	console.log('Sto per redirigere');
	res.redirect('/home');
});

app.listen(8080);
