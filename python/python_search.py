import pika
import pycouchdb
import json
import hashlib
from urllib2 import Request, urlopen


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
	
	return float(response_body["sources"][1]["snapped_distance"])

def get_json_risultati(risultati,database):
	json_dict = {}
	for elem in risultati:
		json_dict[elem]=database[elem]
	return json.dumps(json_dict, ensure_ascii=False)
		
	

def algoritmo(database,info): #occorre ancora sortare alla fine
	lista_prezzo = []
	for doc in database:
		if(doc[stampanteprezzo]<=info[stampanteprezzo]):
			lista_prezzo.append(doc[stampanteid])
	lista_tipo = []
	for elem in lista_prezzo:
		if(database[elem][stampantetipo]==info[stampantetipo]):
			lista_tipo.append(elem)
	dizionario_finale={}
	lista_distanze=[]
	lista_serie = []
	for elem in lista_tipo:
		distanza = calcola_distanza(doc[elem],info[citta])
		if( distanza < info[tolleranza]):
			dizionario_finale[elem]=distanza
			lista_serie.append(elem)
	return lista_serie
	


def on_request(ch, method, props, body):
	print("parte la robba")
	server = pycouchdb.Server('http://localhost:5984')
	printers = server.database("printers")
	risultati = algoritmo(printers,json.loads(body))
	json_ris = get_json_risultati(risultati,printers)
		
	
	
	
	ch.basic_publish(exchange='',
                     routing_key=props.reply_to,
                     properties=pika.BasicProperties(correlation_id = \
                                                         props.correlation_id),
                     body=str(json_ris))


connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()
channel.queue_declare(queue='search_q')
channel.basic_consume(on_request, queue='search_q')
channel.start_consuming()
