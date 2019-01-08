import pycouchdb
import json
import hashlib
from urllib2 import Request, urlopen
import requests
import random
from flask import Flask, render_template, request, redirect, url_for, flash, make_response

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
	# print("[get_json_risultati] risultati = ")
	# print(risultati)
	# print("[get_json_risultati] database = ")
	# print(database)
	cont = 0
	for elem in risultati.keys():
		json_dict[str(cont)]=database.get(elem)
		json_dict[str(cont)]["distanza"]=risultati[elem]
		print(json_dict)
		cont+=1
	json_dict["numero"]=cont
	return json.dumps(json_dict)

def algoritmo(database,info): #occorre ancora sortare alla fine
	if(info):
		lista_id = get_lista_docs()
		#faccio il check sulla spedizione
		if info.get("vartipospedizione") == "ritiro":
			lista_prezzo = []
			# print("[algoritmo] lista_id = ")
			# print(lista_id)
			lista_tipo = []
			#il primo ciclo filtra sul tipo stampante
			for elem in lista_id:
				if database.get(elem)["varconsegna"]=="si":
				# print("[algoritmo] stampantetipoInfo = ",str(info.get("stampantetipo")),"stampantetipodatabase= ",database.get(elem)["stampantetipo"])

				
					if database.get(elem)["stampantetipo"]==info.get("stampantetipo"):
						# print("[algoritmo] match di tipo stampante trovato")

						lista_tipo.append(elem)
			#il secondo ciclo filtra sul prezzo
			for doc in lista_tipo:
				# print("[algoritmo] prezzoInfo = ",info.get("stampanteprezzo"),"prezzodatabase= ",database.get(doc)["stampanteprezzo"])
				
				if float(database.get(doc).get("stampanteprezzo")) <= float(info.get("stampanteprezzo")):
					lista_prezzo.append(doc)
					#print("[algoritmo] appeso prezzo all lista_prezzo")
				
			lista_serie = []
			#il terzo sulle distanze(TO BE DONE)
			dizionario = {}
			for elem in lista_prezzo:
				#print("[algoritmo]entrato in ciclo calcola distanza")
				doc = database.get(elem)
				distanza = calcola_distanza(str(doc.get("varindirizzo")),str(doc.get("varcitta")),str(doc.get("varprovincia")),str(doc.get("varpaese")),str(doc.get("varcap")),str(info.get("via")),str(info.get("varcitta")),str(info.get("varprovincia")),str(info.get("varpaese")),str(info.get("varcap")))
				if distanza <= float(info.get("tolleranza")):
					#print("[algoritmo]",distanza,"e' minore dellatolleranza  "+ info.get("tolleranza"))
					lista_serie.append(elem)
					dizionario[elem]=distanza
				else :
					print("[algoritmo]",distanza,"e' maggiore della tolleranza "+ info.get("tolleranza"))
			return dizionario
		else:
			lista_prezzo = []
			lista_tipo = []
			dizionario = {}
			for elem in lista_id:
				if database.get(elem)["varspedizione"]=="si":
					if database.get(elem)["stampantetipo"]==info.get("stampantetipo"):
						lista_tipo.append(elem)
			for doc in lista_tipo:
				if float(database.get(doc).get("stampanteprezzo")) <= float(info.get("stampanteprezzo")):
					lista_prezzo.append(doc)
					dizionario[doc]=""
			return dizionario

app = Flask(__name__)
server = pycouchdb.Server('http://localhost:5984')
printers = server.database("printers")


@app.route('/search', methods = ["POST"])
def search():
	fopen = open("parte_fissa.txt","r") 
	parte_fissa = str(fopen.read())

	#print(parte_fissa)
	if request.method == "POST":
		risultati = algoritmo(printers,request.form)
		cookie = str(request.cookies.get("id"))
		print(cookie)
		if len(risultati)>0:
			ris = json.loads(get_json_risultati(risultati,printers))
			for i in range(0,int(ris["numero"])):
				stampante = ris[str(i)]
				#print(stampante)
				
				# testo="<div role='tabpanel' class='description'><div class='tab-pane active'><div class='col-xs-12'>"+"<h1><center>Risultato numero: "+str(i+1)+"<center><br></h1>"+"<h2>"+"venditore"+stampante["varuser"]+"<br></h2>"+"<p>"+"indirizzo: "+stampante["varindirizzo"]+"<br>"+"citta: "+stampante["varcitta"]+"<br>"+"email: "+stampante["varemail"]+"<br>"+"telefono: "+stampante["vartelefono"]+"<br>"""+"tipo stampante: "+stampante["stampantetipo"]+"<br>"+"nome stampante: "+stampante["stampantenome"]+"<br>"+"id stampante: "+stampante["stampanteid"]+"<br>"""+"prezzo stampante: "+stampante["stampanteprezzo"]+"<br></p></div>"+"</div></div>"
				testo_leo="<tr><td id='user"+str(i+1)+"'>"+str(stampante["varuser"])+"</td><td id='indirizzo"+str(i+1)+"'>"+str(stampante["varindirizzo"])+"</td><td id='citta"+str(i+1)+"'>"+str(stampante["varcitta"])+"</td><td id='mail"+str(i+1)+"'>"+str(stampante["varemail"])+"</td><td id='telefono"+str(i+1)+"'>"+str(stampante["vartelefono"])+"</td><td id='stampantetipo"+str(i+1)+"'>"+str(stampante["stampantetipo"])+"</td><td id='stampantenome"+str(i+1)+"'>"+str(stampante["stampantenome"])+"</td><td id='stampanteid"+str(i+1)+"'>"+str(stampante["stampanteid"])+"</td><td id='prezzo"+str(i+1)+"'>"+str(stampante["stampanteprezzo"])+"</td><td id='spedizione"+str(i+1)+"'>"+str(stampante["varspedizione"])+"</td><td id='consegna"+str(i+1)+"'>"+str(stampante["varconsegna"])+"</td><td id='distanza"+str(i+1)+"'>"+str(stampante["distanza"])+"</td><td><button onclick=gmail('"+str(i+1)+"','"+cookie+"')>Contatta</button></td></tr>"

				parte_fissa+=testo_leo
			parte_fissa+="</table></body></html>"
			res = make_response(parte_fissa)
			return res
			
		else:
			parte_fissa+"<div role='tabpanel' class='description'><div class='tab-pane active'>"+"<h1><center>Nessun risultato,siamo spiacenti!<center></h1></div></div></body></html>"
			parte_fissa+="</table></body></html>"
			return parte_fissa
