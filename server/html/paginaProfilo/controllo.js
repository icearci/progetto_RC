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
					document.getElementById('nome').innerHTML=arr1[0]+' '+arr1[1];
					document.getElementById('nome1').innerHTML=arr1[0];
					document.getElementById('cognome').innerHTML=arr1[1];
					document.getElementById('mail').innerHTML=utente.mail;
					document.getElementById('telephone').innerHTML=utente.telephone;
				}
				else{
					t=t+1;
					var messaggio=event.data;
					var stampante=JSON.parse(messaggio);
					var tipo=stampante.stampantetipo.split('_');
					var q='';
					for (c=0; c<tipo.length; c++){
						q=q+' '+tipo[c];
					}
					var testo=
					/*"<div class='row'><h1 id='NomeStampante'>"+stampante.stampantenome+"<br></h1>"+
						  "<p><br>Tipologia:</p><p id='Tipologia'>"+stampante.stampantetipo+"<br></p>"+
                          "<p><br>Prezzo per ora:</p><p id='prezzo'>"+stampante.stampanteprezzo+"<br></p>"+
						  "</div><br>";*/
						 /* "<div role='tabpanel' class='description'><div class='tab-pane active'><div class='col-xs-12'>"+*/
						"<div role='tabpanel' class='description'><div class='tab-pane active'><div class='col-xs-12'>"+
								  "<h1><center>Stampante numero: "+(t-1)+"<center><br></h1>"+
								  "<h2>"+stampante.stampantenome+"<br></h2>"+
								  "<p>"+
									  "indirizzo: "+stampante.varindirizzo+"<br>"+
									  "città: "+stampante.varcitta+"<br>"+
									  "email: "+stampante.varemail+"<br>"+
									  "telefono: "+stampante.vartelefono+"<br>"+
									  "tipo stampante: "+q+"<br>"+
									  "id stampante: "+stampante.stampanteid+"<br>"+
									  "prezzo stampante: "+stampante.stampanteprezzo+"<br></p></div>"+
							  "<img id='printer' style='-webkit-user-select: none;cursor: zoom-in;' src='../html/immagini/Smart 3D Printer(800x600).png'width='400' height='400'>"+
							"</div></div>";
					document.getElementById("stampa1").innerHTML = document.getElementById("stampa1").innerHTML+testo;	
				}
			};
	};
}
}
