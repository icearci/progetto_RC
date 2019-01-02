import pika
import pycouchdb
import json
import hashlib
from urllib2 import Request, urlopen

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
	

def calcola_distanza(luogo1,luogo2):
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

def get_json_risultati(risultati,database):
	json_dict = {}
	print("[get_json_risultati] risultati = ")
	print(risultati)
	print("[get_json_risultati] database = ")
	print(database)
	for elem in risultati:
		json_dict[elem]=database.get(elem)

	return json.dumps(json_dict, ensure_ascii=False)
		
	

def algoritmo(database,info): #occorre ancora sortare alla fine
	if(info):
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
			
			
		
		dizionario_finale={}
		lista_distanze=[]
		lista_serie = []
		#il terzo sulle distanze(TO BE DONE)
		for elem in lista_prezzo:
			print("[algoritmo]entrato in ciclo lista_tipo")
			distanza = calcola_distanza(database.get(elem)["varcitta"],info.get("varcitta"))
			if distanza < float(info.get("tolleranza")):
				print("[algoritmo]",distanza,"e' minore dellatolleranza  "+ info.get("tolleranza"))
				dizionario_finale[elem]=distanza
				lista_serie.append(elem)
			else :
				print("[algoritmo]",distanza,"e' maggiore della tolleranza "+ info.get("tolleranza"))
		return lista_serie
	else: 
		print("[algoritmo] info vuoto")
		return
	


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
	risultati = algoritmo(printers,json.loads(body,parse_int=True))
	print("[on request] -------------->end->algoritmo(printers,json.loads(body))")
	if(risultati):
		print("[on request] -------------->start->get_json_risultati(risultati,printers)")
		json_ris = get_json_risultati(risultati,printers)
		print("[on_request]json_ris= ")
		print(json_ris)
		print("[on request] -------------->end->get_json_risultati(risultati,printers)")
		
	
	
	
		ch.basic_publish(exchange='',
						routing_key=props.reply_to,
						properties=pika.BasicProperties(correlation_id = \
															props.correlation_id),
						body=str(json_ris))
		
		ch.basic_ack(delivery_tag = method.delivery_tag)

		ch.basic_qos(prefetch_count=1)
	else :
		json_ris=""
		print("risultati vuoto")
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()
channel.queue_declare(queue='search_q')
channel.basic_consume(on_request, queue='search_q')
channel.start_consuming()

