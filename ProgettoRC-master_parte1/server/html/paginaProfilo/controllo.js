window.onload=function(){
		prova();
	 };

function prova(){
	//variabili user
	var nome=document.getElementById('nome');
	var nome1=document.getElementById('nome1');
	var cognome=document.getElementById('cognome');
	var città=document.getElementById('mail');
	//document.getElementById('nome').innerHTML='ciao';
	//variabili stampante
	var nomestampante=document.getElementById('nomestampante');
	var tipologia=document.getElementById('tipologia');
	var laser=document.getElementById('laser');
	var cnc=document.getElementById('cnc');
	var prezzo=document.getElementById('prezzo');
	var spedizioni=document.getElementById('spedizioni');
	var consegna=document.getElementById('consegna');
	var error = 0;
	<!-->Spazio per controllare gli errori e definire la variabile error<!-->
	if(!error){
		var msg =document.cookie;
		var ws = new WebSocket("ws://localhost:8084");
		ws.onopen = function(){
			ws.send(msg);
			ws.onmessage = function(event){
				var messaggio=event.data;
				var utente = JSON.parse(messaggio);
				var arr1=utente.fullname.split(' ');
				document.getElementById('nome').innerHTML=utente.fullname;
				document.getElementById('nome1').innerHTML=arr1[0];
				document.getElementById('cognome').innerHTML=arr1[1];
				document.getElementById('mail').innerHTML=utente.mail;
				
			}
		}
	}
}
