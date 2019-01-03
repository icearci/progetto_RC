import pika
import pycouchdb
import json
import hashlib
from urllib2 import Request, urlopen
import requests

#nM8W4oBYrRSKLAWcB12JBRdJsrOjBOwM

connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()
channel.queue_declare(queue='search_q',auto_delete = True)

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
	

def calcola_distanza1(luogo1,luogo2):
	headers = {
	'Accept': 'application/json; charset=utf-8'
		}
	richiesta_geocoding1 = Request('https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf6248228ad9c82d354084a44aed7cfa290c1a&text='+luogo1+'&sources=osm&boundary.country=IT&size=1&', headers=headers)
	richiesta_geocoding2 = Request('https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf6248228ad9c82d354084a44aed7cfa290c1a&text='+luogo2+'&sources=osm&boundary.country=IT&size=1', headers=headers)
	geocoding1 = json.loads(urlopen(richiesta_geocoding1).read())
	geocoding2 = json.loads(urlopen(richiesta_geocoding2).read())

	coord1 = geocoding1["features"][0]["geometry"]["coordinates"]
	coord1.reverse()

	coord2=geocoding2["features"][0]["geometry"]["coordinates"]
	coord2.reverse()

	request = Request('https://api.openrouteservice.org/matrix?api_key=5b3ce3597851110001cf6248228ad9c82d354084a44aed7cfa290c1a&profile=driving-car&metrics=distance&locations='+str(coord1[0])+','+str(coord1[1])+'%7C'+str(coord2[0])+','+str(coord2[1]), headers=headers)
	response_body = json.loads(urlopen(request).read())
	print(response_body)
	print(response_body["sources"][0]["snapped_distance"])
	return float(response_body["sources"][0]["snapped_distance"])

		
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
				
				if database.get(doc).get("stampanteprezzo") <= info.get("stampanteprezzo"):
					lista_prezzo.append(doc)
					print("[algoritmo] appeso prezzo all lista_prezzo")
				
			lista_serie = []
			#il terzo sulle distanze(TO BE DONE)
			for elem in lista_prezzo:
				print("[algoritmo]entrato in ciclo calcola distanza")
				doc = database.get(elem)
				distanza = calcola_distanza(str(doc.get("varindirizzo")),str(doc.get("varcitta")),str(doc.get("varprovincia")),str(doc.get("varpaese")),str(doc.get("varcap")),str(info.get("varindirizzo")),str(info.get("varcitta")),str(info.get("varprovincia")),str(info.get("varpaese")),str(info.get("varcap")))
				if distanza <= float(info.get("tolleranza")):
					print("[algoritmo]",distanza,"e' minore dellatolleranza  "+ info.get("tolleranza"))
					lista_serie.append(elem)
				else :
					print("[algoritmo]",distanza,"e' maggiore della tolleranza "+ info.get("tolleranza"))
			return lista_serie
			
	


def on_request(ch, method, props, body):
	print("\n \n \n \n #################################################################\n \n \n \n########################## nuova iterazioene ####################\n \n \n \n#################################################################\n \n \n \n")
	print("[on request] -------------->start->pycouchdb.Server('http://localhost:5984')")
	server = pycouchdb.Server('http://localhost:5984')
	print("[on request] -------------->end ->pycouchdb.Server('http://localhost:5984')")

	print("[on request] -------------->start->server.database('printers')")

	printers = server.database("printers")
	print("[on request] -------------->end->server.database('printers')")
	# print("[on request]",body)

	print("[on request] -------------->start->algoritmo(printers,json.loads(body))")
	risultati = algoritmo(printers,json.loads(body))
	print("[on request] -------------->end->algoritmo(printers,json.loads(body))")
	if(risultati):
		print("[on request] -------------->start->get_json_risultati(risultati,printers)")
		json_ris = get_json_risultati(risultati,printers)
		print("[on_request]json_ris= ")
		print(json_ris)
		print("[on request] -------------->end->get_json_risultati(risultati,printers)")
		
	
	
	
		ch.basic_publish(exchange='',
						routing_key="search_q",
						properties=pika.BasicProperties(correlation_id = \
															props.correlation_id),
						body=json_ris)
		print("scritto sulla queue")
		

		
	else :
		json_ris=""
		print("risultati vuoto")
		ch.basic_publish(exchange='',
						routing_key="search_q",
						properties=pika.BasicProperties(correlation_id = \
															props.correlation_id),
						body="noresults")
		print("scritto sulla queue")
	

channel.basic_qos(prefetch_count=1)
channel.basic_consume(on_request, queue='search_q')
channel.start_consuming()
