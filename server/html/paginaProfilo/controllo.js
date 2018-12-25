window.onload=function(){
		prova();
	 };

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
					document.getElementById('nome').innerHTML=utente.fullname;
					document.getElementById('nome1').innerHTML=arr1[0];
					document.getElementById('cognome').innerHTML=arr1[1];
					document.getElementById('mail').innerHTML=utente.mail;
				}
				else if(t===1){
					t=2;
					document.getElementById('stampa').innerHTML=event.data;
				}
				else{
					c=c+1;
					console.log(c);
					stampante=JSON.parse(event.data);
					testo="<div class='row'><div class='description'><h1 id='NomeStampante'></h1><p>Tipologia:</p><p id='Tipologia'>"+stampante.tipologia+"</p><br>"+
                          "<p>Informazioni Laser:</p><p id='laser'>"+stampante.laser+"</p><br><p>Informazioni CNC:</p><p id='cnc'>"+stampante.cnc+"</p><br>"+
                          "<p>Prezzo per ora:</p><p id='prezzo'>"+stampante.prezzo+"</p><br>"+
                          "<p>Spedizioni:</p><p id='spedizioni'>"+stampante.spedizioni+"</p><br>"+
                          "<p>Consegna a mano:</p><p id='consegna'>"+stampante.consegna+"</p><br>"+
						  "</div>"+
						  "<img id='printer' style='-webkit-user-select: none;cursor: zoom-in;' src='../html/immagini/Smart 3D Printer(800x600).png'width='744' height='558'>"+
						  "</div>"+
						  "</div>";
					r='item0'+c.toString();
					document.getElementById(r).innerHTML=testo;
				}	
			}
		}
	}
}
