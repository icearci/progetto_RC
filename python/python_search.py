import pika
import pycouchdb
import json
import hashlib
from urllib2 import Request, urlopen
import requests
from flask import Flask
from flask import request

#nM8W4oBYrRSKLAWcB12JBRdJsrOjBOwM


def get_lista_docs():
	url = "http://localhost:5984/printers/_all_docs"
	headers = {
	'Accept': 'application/json; charset=utf-8'
		}
	richiesta = Request(url,headers=headers)
	risultato = json.loads(urlopen(richiesta).read())
	lista_id = []
	for elem in risultato["rows"]:
		lista_id.append(elem["id"])
	return lista_id
	
	
def calcola_distanza(via1,citta1,provincia1,paese1,cap1,via2,citta2,provincia2,paese2,cap2):
	body = """{
	"locations": [
    {
      "street":"""+via1+""",
      "adminArea6": "",
      "adminArea6Type": "Neighborhood",
      "adminArea5":"""+citta1+""",
      "adminArea5Type": "City",
      "adminArea4": "",
      "adminArea4Type": "County",
      "adminArea3":"""+provincia1+""",
      "adminArea3Type": "State",
      "adminArea1":"""+paese1+""",
      "adminArea1Type": "Country",
      "postalCode":"""+cap1+"""
		  },
	{
      "street":"""+via2+""",
      "adminArea6": "",
      "adminArea6Type": "Neighborhood",
      "adminArea5":"""+citta2+""",
      "adminArea5Type": "City",
      "adminArea4": "",
      "adminArea4Type": "County",
      "adminArea3":"""+provincia2+""",
      "adminArea3Type": "State",
      "adminArea1":"""+paese2+""",
      "adminArea1Type": "Country",
      "postalCode":"""+cap2+"""
		  }
		  ],
	"options": {
    "allToAll": false,
    "unit":"k"
    }
		  }"""
	print("effettuata ricerca per "+via1+citta1+provincia1+paese1+cap1+via2+citta2+provincia2+paese2+cap2)
	r = requests.post("http://www.mapquestapi.com/directions/v2/routematrix?key=nM8W4oBYrRSKLAWcB12JBRdJsrOjBOwM", data = body)
	richiesta = r.json()
	return float(richiesta["distance"][1])

def get_json_risultati(risultati,database):
	json_dict = {}
	print("[get_json_risultati] risultati = ")
	print(risultati)
	print("[get_json_risultati] database = ")
	print(database)
	cont = 0
	for elem in risultati:
		json_dict[str(cont)]=database.get(elem)
		cont+=1
	json_dict["numero"]=cont;
	return json.dumps(json_dict)

def algoritmo(database,info): #occorre ancora sortare alla fine
	if(info):
		#faccio il check sulla spedizione
		if info.get("vartipospedizione") == "manocitta":
			lista_prezzo = []
			lista_id = get_lista_docs()
			# print("[algoritmo] lista_id = ")
			# print(lista_id)
			lista_tipo = []
			#il primo ciclo filtra sul tipo stampante
			for elem in lista_id:
				print("[algoritmo] stampantetipoInfo = ",str(info.get("stampantetipo")),"stampantetipodatabase= ",database.get(elem)["stampantetipo"])

				
				if database.get(elem)["stampantetipo"]==info.get("stampantetipo"):
					print("[algoritmo] match di tipo stampante trovato")

					lista_tipo.append(elem)
			#il secondo ciclo filtra sul prezzo
			for doc in lista_tipo:
				print("[algoritmo] prezzoInfo = ",info.get("stampanteprezzo"),"prezzodatabase= ",database.get(doc)["stampanteprezzo"])
				
				if float(database.get(doc).get("stampanteprezzo")) <= float(info.get("stampanteprezzo")):
					lista_prezzo.append(doc)
					print("[algoritmo] appeso prezzo all lista_prezzo")
				
			lista_serie = []
			#il terzo sulle distanze(TO BE DONE)
			for elem in lista_prezzo:
				print("[algoritmo]entrato in ciclo calcola distanza")
				doc = database.get(elem)
				distanza = calcola_distanza(str(doc.get("varindirizzo")),str(doc.get("varcitta")),str(doc.get("varprovincia")),str(doc.get("varpaese")),str(doc.get("varcap")),str(info.get("via")),str(info.get("varcitta")),str(info.get("varprovincia")),str(info.get("varpaese")),str(info.get("varcap")))
				if distanza <= float(info.get("tolleranza")):
					print("[algoritmo]",distanza,"e' minore dellatolleranza  "+ info.get("tolleranza"))
					lista_serie.append(elem)
				else :
					print("[algoritmo]",distanza,"e' maggiore della tolleranza "+ info.get("tolleranza"))
			return lista_serie
			
	


app = Flask(__name__)
server = pycouchdb.Server('http://localhost:5984')
printers = server.database("printers")
fopen = open("parte_fissa.txt","r") 


@app.route('/search', methods = ["POST"])
def search():
	parte_fissa = str(fopen.read())
	print(parte_fissa)
	if request.method == "POST":
		#varindirizzo = request.form["via"]
		#varcitta = req.form["varcitta"]
		#varprovincia = req.form["varprovincia"]
		#varcap = req.form["varcap"]
		#varpaese = req.form["varpaese"]
		##tolleranza = request.form["tolleranza"]
		#stampantetipo = request.form["stampantetipo"]
		#stampanteprezzo = request.form["stampanteprezzo"]
		#vartipospedizione = request.form["vartipospedizione"]
		risultati = algoritmo(printers,request.form)
		if len(risultati)>0:
			json_ris = get_json_risultati(risultati,printers)
			ris = json.loads(json_ris)
			for i in range(0,int(json.loads(json_ris)["numero"])):
				stampante = ris[str(i)]
				print(stampante)
				testo="<div role='tabpanel' class='description'><div class='tab-pane active'><div class='col-xs-12'>"+"<h1><center>Risultato numero: "+str(i+1)+"<center><br></h1>"+"<h2>"+"venditore"+stampante["varuser"]+"<br></h2>"+"<p>"+"indirizzo: "+stampante["varindirizzo"]+"<br>"+"citta: "+stampante["varcitta"]+"<br>"+"email: "+stampante["varemail"]+"<br>"+"telefono: "+stampante["vartelefono"]+"<br>"""+"tipo stampante: "+stampante["stampantetipo"]+"<br>"+"nome stampante: "+stampante["stampantenome"]+"<br>"+"id stampante: "+stampante["stampanteid"]+"<br>"""+"prezzo stampante: "+stampante["stampanteprezzo"]+"<br></p></div>"+"</div></div></body></head>"
				parte_fissa+=testo
			return parte_fissa
			
		else:
			return parte_fissa+"<div role='tabpanel' class='description'><div class='tab-pane active'>"+"<h1><center>Nessun risultato,siamo spiacenti!<center></h1></div></div></body></head>"
		
	
