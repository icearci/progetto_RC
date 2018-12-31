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

app.use(express.static(__dirname));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookie_parser());

var pagine_utili = ["/login", "/home", "/add_stampante", "/search", "/profilo"];
function generateUuid() {
	return Math.random().toString() +
		Math.random().toString() +
		Math.random().toString();
}

function settaCookie(res, id) {
	for (var i = 0; i < 5; i++) {
		res.cookie('id', id, {
			maxAge: 1800000,
			path: pagine_utili[i]
		});
	}
}
function levaCookie(res) {
	for (var i = 0; i < 5; i++) {
		res.clearCookie('id', {
			path: pagine_utili[i]
		});
	}
}
app.get('/logout', (req, res) => {
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
app.get("/visore", (req, res) => {
	res.sendFile(path.resolve(__dirname + "/html/visore3d/visore_mio.html"));
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
	res.set({ "Content-Type": "text/html" });
	res.sendFile(path.resolve(__dirname + "/html/paginaRicerca/ricercanew.html"));
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


app.post("/add_stampante", (req, res) => {
	var user_id = req.cookies.id;
	console.log("id trovato in add_stampante " + user_id);
	if (user_id === md5(req.body.varuser)) {
		var stampante = {
			varuser: req.body.varuser,
			varindirizzo: req.body.varindirizzo,
			varcitta: req.body.varcitta,
			varemail: req.body.varemail,
			vartelefono: req.body.vartelefono,
			stampantetipo: req.body.stampantetipo,
			stampantenome: req.body.stampantenome,
			stampanteid: req.body.stampanteid,
			stampanteprezzo: req.body.stampanteprezzo,


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
	// res.cookie('id', hash, {
	// 	maxAge: 20000,
	// 	path: "/login"
	// });
	// res.cookie('id', hash, {
	// 	maxAge: 20000,
	// 	path: "/home"
	// });
	// res.cookie('id', hash, {
	// 	maxAge: 20000,
	// 	path: '/profilo'
	// });
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

app.post('/search', (req, res) => {

	var parte_fissa = fs.readFileSync(path.resolve(__dirname + "/html/paginaRicerca/parte_fissa.txt"), { encoding: "utf-8" });
	/*var city = document.getElementById('user_city').value;
            var tollerance = document.getElementById('user_dist_tollerance').value;
            var price = document.getElementById('max_hour_price').value;
            var printer = document.getElementsByName('stampantetipo').value;
            var expedition = document.getElementsByName('vartipospedizione').value;
            var msg = city+'/'+tollerance+'/'+price+'/'+printer+'/'+expedition;        
			 
			
			vartipospedizione
			via
			cap
			*/
	var id = req.cookies.id;
	var citta_ = req.body.ricerca;
	var via_ = req.body.via;
	var cap_=req.body.cap;
	var stampanteprezzo_ = req.body.stampanteprezzo;
	var stampantetipo_ = req.body.stampantetipo;
	var vartipospedizione_ = req.body.vartipospedizione;
	var tolleranza_ = req.body.tolleranza;

	var info = {
		varcitta: citta_,
		via: via_,
		cap: cap_,
		tolleranza: tolleranza_,
		stampantetipo: stampantetipo_,
		stampanteprezzo: stampanteprezzo_,
		vartipospedizione: vartipospedizione_,
	};
	console.log(info);
	amqp.connect('amqp://localhost', function(err, conn) {
		if(!err){
			var queue = 'search_q';
			conn.createChannel(function(err,ch){
				ch.assertQueue('', {exclusive: true},function(err,q){
					var corr = generateUuid();


					ch.sendToQueue('search_q',new Buffer(JSON.stringify(info)), { correlationId: corr, replyTo: 'search_q', content_type: "application/json" });



					ch.consume(q.queue, function(msg) {
					if (msg.properties.correlationId == corr) {
						console.log(msg.content.toString());//finire

					setTimeout(function() { conn.close(); process.exit(0) }, 500);
					}},{noAck:true});
				});
			});
		}
	});

});
app.post('/prova', (req, res) => {
	console.log(req.body);
	res.send(req.body);
});
app.listen(8080);
