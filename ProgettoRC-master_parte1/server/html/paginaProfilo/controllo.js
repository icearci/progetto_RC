function prova(){
	//variabili user
	var nome=document.getElementById('nome');
	var nome1=document.getElementById('nome1');
	var cognome=document.getElementById('cognome');
	var città=document.getElementById('città');
	var occupazione=document.getElementById('occupazione');
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
		alert(msg);
		var ws = new WebSocket("ws://localhost:8083");
		ws.onopen = function(){
			ws.send(msg);
			ws.onmessage = function(event){
	
	
	
	
}
