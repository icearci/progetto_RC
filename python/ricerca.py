import couchdb
import pika

#definisco le stringhe HTML
html1="""<li>
                          <a href="#item01">
                            <img id="printer" style="-webkit-user-select: none;cursor: zoom-in;" src="../html/immagini/Smart 3D Printer(800x600).png"width="744" height="558">
                          </a>
                      </li>"""
htmlag=""" <li>
                          <a class="image" href="#item00">
                              <img style="-webkit-user-select: none;cursor: zoom-in;" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQuLiKOVc6xoR2MmY7X8RFKJaMwzE_A12ZAvFB4QQEcarYEPCCvQ"width="744" height="558">
                              
                          </a>
                      </li>
                  </ul>
              </div> <!-- / row --><br>"""

html2="""<div id="item01" class="port">
			<p>seeee cazzussss</p>
			
              </div> """



#definisco la ricezione
def callback(ch, method, properties, body):
	print('messaggio ricevuto')
	print(body)
	if(body):
		l=conta_stampati(body)
		testo=analisi_testo(l)
		channel.basic_publish(exchange='', routing_key='ricevi', body=testo)
		t=str(len(l))
		print('siamo qui')
		channel.basic_publish(exchange='', routing_key='ricevi',body=t)
		print('siamo qui')
		for c in l:
			channel.basic_publish(exchange='', routing_key='ricevi', body=c)
			print('inviato tutto')
			

def conta_stampati(s):
	l=[]
	couch=couchdb.Server("http://localhost:5984/")
	for c in couch["stampanti"]:
		if s in couch['stampanti'][c].values():
			l.append(c)
	return l


#mia funzione di analisi
def analisi_testo(lung):
	finale=''
	for c in range(len(lung)):
		t=html1
		t=t[:45]+str(c+1)+t[47:]
		finale=finale+t
	finale=finale+htmlag
	for c in range(len(lung)):
		t=html2
		t=t[:13]+str(c+1)+t[15:]
		finale=finale+t
		finale="<div class='row' ><ul>"+finale
	print('siamo qua')
	return finale


#creo la connessione rabbit
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='ricevi', durable=True)
channel.queue_declare(queue='invia', durable=True)
print('in attesa di messaggi')
channel.basic_consume(callback,queue='invia', no_ack=True)
channel.start_consuming()
