function prova(){
	//variabili user
	var nome=document.getElementById('nome');
	var nome1=document.getElementById('nome1');
	var cognome=document.getElementById('cognome');
	var città=document.getElementById('mail');
	var error = 0;
	var stampante='';
	var testo='';
	var r='';
	var t=0;
	if(!error){
		var msg =document.cookie;
		var ws = new WebSocket("ws://localhost:8084");
		ws.onopen = function(){
			ws.send(msg);
			var c=0;
			ws.onmessage = function(event){
				if(t===0){
					t=1;
					var messaggio=event.data;
					var utente = JSON.parse(messaggio);
					var arr1=utente.fullname.split(' ');
					document.getElementById('nome1').innerHTML=arr1[0];
					document.getElementById('cognome').innerHTML=arr1[1];
					document.getElementById('mail').innerHTML=utente.mail;
					document.getElementById('telephone').innerHTML=utente.telephone;
				}
				else{
					t=t+1;
					var messaggio=event.data;
					var stampante=JSON.parse(messaggio);
					var testo=
					"<div class='row'><h1 id='NomeStampante'>"+stampante.stampantenome+"</h1><br><br><p>Tipologia:</p><p id='Tipologia'>"+stampante.stampantetipo+"</p><br>"+
                          "<br><p>Prezzo per ora:</p><p id='prezzo'>"+stampante.stampanteprezzo+"</p><br>"+
						  "</div><br>";
					document.getElementById("stampa1").innerHTML = document.getElementById("stampa1").innerHTML+testo;	
				}
			};
	};
}
}
