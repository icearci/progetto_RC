# Progetto Reti di Calcolatori

# Requisiti
I requisiti richiesti dalla consegna sono:
 1. Il servizio REST che implementate (lo chiameremo SERV) deve offrire delle API documentate (e.g. GET /sanlorenzo fornisce tutti i cinema di sanlorenzo)
 2. SERV si deve interfacciare con almeno due servizi REST “esterni”, cioè non su localhost
 3. Almeno uno dei servizi REST esterni deve essere “commerciale” (es: twitter, google, facebook, pubnub, parse, firbase etc
 4. Almeno uno dei servizi REST esterni deve richiedere oauth
 5. Si devono usare Websocket e/o AMQP (o simili es MQTT)
 6. Il progetto deve essere su GIT (GITHUB, GITLAB ...) e documentato don un README
 7. Le API  REST implementate in SERV devono essere documentate su GIT e devono essere validate con un caso di test 
 
# Tecnologie adottate:
 - Websocket
 - amqp (rabbitmq)
 - rest 1 (non commerciale) --> mapquest
 - rest 2 (commerciale) --> Gmail (Google)
 -backend database --> CouchDB
 
# Progetto Reti di Calcolatori


# Printable of Things

Lo scopo del sito è quello di fornire API  REST che hanno come obiettivo principale quello di riuscire a mettere in contatto un cliente con un maker.
Per maker si intende una persona fisica che possiede, e mette a disposizione, una stampante 3D, o un mezzo di produzione di manufatti 3D.
Per cliente si intende una qualsiasi persona fisica che abbia necessità di usufruire del servizio di un maker.
Attraverso Docker eseguiamo un’ effettiva build dei vari servizi, che vengono specificati nel docker-compose:

- Il server “server”, che si poggia su Nodejs è il server che ci permette di gestire le richieste alle varie pagine html, ed è il cuore della web application
- Il server “python_search”, che viene implementato attraverso Flask, gestisce l’ algoritmo di ricerca grazie al quale si filtrano i risultati in base alla vicinanza
- Un set di websocket_servers, che gestiscono tutte le richieste dinamiche/asincrone che provengono lato client
- Un broker di messagistica, implementato con RabbitMQ, che grazie a amqp permette la comunicazione fra i vari servizi
- Un backend-database, implementato con CouchDB, che gestisce le informazioni degli utenti
- Un reverse proxy (Nginx) che effettua bilanciamento del carico e che gestisce connessioni SSL (self-signed).


# Server

Si occupa di servire pagine html, che si trovano nella cartella “html”. 
Il server è responsabile di fornire i seguenti servizi principali:
- /register: permette di registrare un nuovo utente, e di creare un record nel database con i vari dati.
- /login: fornisce un semplice meccanismo di autenticazione basato sui cookies (“id”), che fanno riferimento al record nel database. Lato client verrà inviato un messaggio tramite Websocket contenente username e password ( es login?username/password ). Riceverà indietro un messaggio di “ok” o di “refuse”. In caso di risposta positiva effettuerà la POST al server, che setterà il cookie per segnalare l’ accesso corretto. Il cookie “id” è uguale all’ hash dello username ( che garantisce unicità ).
- /logout: permette di effettuare un logout, con effettiva rimozione dei cookies presenti nei vari path utili
- /add_stampante: permette di aggiungere una stampante, che verrà memorizzata attraverso l’ hash del suo numero di serie all’ interno del database /printers, e anche all’ interno del database utenti, nel documento inerente all’ utente che ha effettuato la richiesta, il quale tra i vari campi possiede anche un array di stampanti.
- /profilo: permette a un qualsiasi utente loggato di verificare le informazioni inserite in fase di registrazione. In particolare è possibile eliminare una stampante dall’ elenco.
- /search: fornisce la form per la ricerca della stampante che rispetta i requisiti del cliente, dopodiché entra in gioco il server python_search, che gestirà il resto. E’ importante che le informazioni sulle località siano immesse correttamente e con precisione per poter garantire il corretto funzionamento di MapQuest
- /gmail: è il trampolino di lancio per le varie richieste, sempre in ottica REST, per usufruire dei servizi Gmail. Infatti l’ utente, in seguito ai risultati ritornati dal python_search può voler comunicare il suo interesse al maker, attraverso il button “Contatta”. Qui avverrà la redirezione del client a /gmail e ancora un’ altra all’ autenticazione interamente derogata a Google, che avrà come fine quello di ottenere un authorization code.
- /redirect: è questo l’ uri di redirezione associato alle credenziali Google di “ProgettoRC”, e qui, una volta avvenuta l’ autenticazione e ottenuto l’  ”autorization code”, verrà richiesto il token e verrà effettuata la chiamata REST che permetterà di inviare il messaggio automatico, codificato in base64. Tutto questo però non può avvenire senza prima aver estrapolato i dati che sono contenuti nei risultati ritornati dal server “python_search”. RabbitMQ è fondamentale in questo caso, che permette di ricavare le informazioni attraverso la comunicazione fra “server” e “ws_gmail”, visto che quest’ ultimo a sua volta aveva ricevuto un messaggio asincrono riportante tutte le info dal websocket lato client.
- /chi_siamo, /faq, /news, /tecnologie: servono pagine html che riportano varie informazioni riguardo al funzionamento dello stesso



# python_search

Il server python richiede alcuni moduli da installare tramite pip, e ciò viene fatto nel dockerfile, attraverso la copia all’ interno del container del file “requirements.txt”. Grazie ad esso il server è in grado di interfacciarsi con più facilità con CouchDB (pycouchdb) e attraverso l’ utilizzo del modulo gevent è possibile far interfacciare Nginx con Flask.
Python_search dopo aver atteso l’ inizializzazione del server “server” attraverso l’ uso dello script wait-for-it.sh , per prevenire fallimenti dovuti all’ assenza del database “printers”, che viene inizializzato da “server”, si mette in ascolto sulla porta 5000 (predefinita) e attende delle chiamate POST sulla route /python_search, definita (come tutte le route) nel file di configurazione del load balancer. Ogni volta che riceve una richiesta, procede in due passi successivi:
- reperisce con una lettura del file di testo “parte_fissa.txt” la prima parte della pagina html che andrà a restituire al client;
- effettua l’ algoritmo di ricerca, che tiene conto delle varie info immesse dal cliente, in particolare sulla consegna e sulla spedizione, e genera tante porzioni di html quanti sono i risultati dell’ algoritmo, che verranno aggiunti alla parte_fissa e inviati indietro al client.
Ogni risultato sarà identificato da una riga in una tabella, in cui ogni campo è contrassegnato da un id, che tiene conto del tipo di info e della posizione (es. “<td id = ‘stampante1’>, dove il numero “1” sta a indicare a quale record della tabella ci si riferisce). Al click del button “contatta” si avvierà la comunicazione tramite websocket (con ws_gmail) di cui si è già parlato.




# Websocket Servers

Il set di websocket server costituisce l’ endpoint delle comunicazioni asincrone che vengono lato client, che a volte hanno bisogno di messaggi ripetuti, per i quali non serve specificare ogni volta gli header http. Vediamo più in dettaglio che servizi offrono:
- ws_login: non è conveniente implementare un servizio di logging semplicemente utilizzando GET e POST. Quando si tenta di effettuare il login viene inviato un messaggio asincrono lato client verso ws_login, viene controllato se esiste un documento che sia conforme all’ username e password immessi, e in caso negativo viene inviato un nuovo messaggio “refuse”, mentre in caso positivo il testo del messaggio è “ok”.
- ws_register: è necessaria una comunicazione asincrona poiché non è possibile avere due utenti con lo stesso username, quindi nel caso in cui un utente scelga uno username non valido gli viene notificato attraverso un messaggio tramite websocket. Nel caso non ci siano errori viene eseguita la post al server “server”, che elaborerà le informazioni.
- ws_stampante: è il websocket che si occupa della messagistica asincrona per quanto riguarda aggiunta o rimozione di una stampante. Nel caso di aggiunta ha lo stesso ruolo che aveva il ws_register per la registrazione degli utenti; riceve un messaggio del tipo “add_stampante?numerodiserie” a cui viene risposto con un “refuse” o un “ok”. Nel caso di rimozione il messaggio inviato è “remove_stampante?numerodiserie”, e questa operazione viene svolta in due passi:
   1) rimozione della stampante dal database /printers;
   2) rimozione della stampante dall’ array “stampanti” dell’ utente che effettua la remove.
- ws_profilo: questo websocket server si occupa di reperire e inviare informazioni sullo user loggato che effettua una GET /profilo. Riceve un messaggio con l’ identificativo dell’ utente loggato e risponde con un testo in json che contiene tutte le info reperite da /users/identificativo, che vengono elaborate lato client.
- ws_gmail: è essenziale nell’ implementazione della chiamata REST a l’ API Gmail; riceve un messaggio asincrono dal client contenente le info del risultato che il cliente vuole contattare. Di particolare importanza è l’ ultima parte del messaggio, che contiene l’ identificativo dell’ utente che vuole inviare l’ email. Infatti ws_gmail può comunicare con il server grazie a RabbitMQ, generando una coda univoca (es. “gmailidentificativo”) e scrivendoci un messaggio che contiene tutte le info utili per il componimento dell’ email.








# Load Balancer (Nginx)

L’ infrastruttura si avvale di un reverse proxy implementato con Nginx, che ha a disposizione delle chiavi pregenerate, con certificato self-signed, e che quindi può accettare richieste di connessione sicure sulla porta 4443. Il file di configurazione definisce due direttive upstream: una per i servizi che richiedono l’ intervento del server di tipo Nodejs, e una per i servizi che richiedono l’ intervento del server di tipo Flask. Ovviamente il load balancing di base è di tipo Round-Robin. In seguito vi sono molte direttive location, ma che si possono raggruppare in due macro-gruppi:
- quelle che riguardano le richieste HTTP/1.1 standard, che vengono gestite dal server “server”, o dal server “python_search”;
- quelle che riguardano le connessioni websocket, che hanno bisogno di un trattamento differenziato. Infatti le connessioni websocket si differenziano da quelle HTTP standard per mezzo dell’ header Upgrade.



# Backend database (CouchDB)

Il database è in ascolto sulla porta predefinita 5984, e nello start effettua un healthcheck per evitare crash nel caso in cui qualche servizio dipendesse da lui e fosse già operativo.
CouchDB in questo caso gestisce due database:
- /users: è il database degli utenti, dove ogni utente ha un id unico, che viene dall’ hash del nome utente scelto in fase di registrazione. Ogni documento comprende vari campi per le informazioni personali e in particolare vi è anche un array di stampanti che semplifica il compito di ricerca delle stampanti di un utente quando viene effettuata una GET /profilo
- /printers: è il database delle stampanti, dove ogni documento rappresenta una stampante ed ha un identificativo unico dato dall’ hash del numero di serie della stampante.

# Informazioni aggiuntive e test

All’ interno del link git ci sono 4 cartelle principali, ognuna per un servizio descritto sopra.
Ogni cartella ha al suo interno dei file che servono per la dockerizzazione. Infatti c’è sempre un Dockerfile, che ha il compito di buildare un immagine “pronta all’ uso”, copiando all’ interno del container tutti i file utili (attraverso il comando COPY), e installando tutti i requirements di cui il servizio ha bisogno. Nel caso di servizi che utilizzano un immagine node:8, quali websocket servers e il server “server”, è stato pensato di fornire un package.json esprimendo tutte le dipendenze e definendo lo script di start del servizio. Per il server “python_search” il package.json è stato sostituito da un semplice requirements.txt.
Analizzando il Docker compose è possibile notare che più volte è stato usato il wait-for-it.sh, sotto consiglio della documentazione Docker. Il codice sorgente è scaricabile da github, e permette di pingare costantemente il servizio “più lento” ad avviarsi. Infatti la direttiva “depends_on” è utile solo per aspettare che il container in questione vada in running, non ad attendere effettivamente che il servizio sia pronto e stabile. Quindi wait-for-it.sh stoppa il container fino a quando il ping non riceve risposta da parte del servizio “lento”.
Al momento del lancio del docker-compose, più precisamente nel momento in cui il server inizia ad ascoltare, vengono generati dei casi test attraverso la funzione GeneraDB(), che genera
tre utenti diversi, ciascuno con 2 stampanti con caratteristiche diverse. Proprio per semplificare questa azione è stato pensato di mappare anche la porta del backend sever, che, in condizioni di operatività normale dovrebbe essere "nascosto".
Quindi su http://localhost:5984/ è possibile vedere le caratteristiche di tutti gli utenti e di tutte le stampanti ad essi associati per effettuare delle ricerche test. Altrimenti è possibile visualizzarli
senza accedere al database nel file server.js (variabile "test" di tipo json).

# Caso Test


Per prima cosa bisogna registrare un nuovo utente

![Imgur Image](/screenshot_progetto/registrazione.png)


Poi possiamo procedere con il login

![Imgur Image](/screenshot_progetto/login.png)


Ora che abbiamo effettuato l' accesso possiamo aggiungere una stampante cliccando su aggiungi macchina (/add_stampante) e inserendo i dati

![Imgur Image](/screenshot_progetto/add_stampante_1.png)
![Imgur Image](/screenshot_progetto/add_stampante_2.png)


Per vedere se la nuova stampante è stata registrata correttamente basta andare sul profilo (/profilo)

![Imgur Image](/screenshot_progetto/profilo.png)


Adesso entriamo nel vivo della web app, effettuando una ricerca. Come sappiamo gli input spedizione e consegna sono importanti, poiché i risultati verranno filtrati anche in base ad essi

![Imgur Image](/screenshot_progetto/ricerca_1.png)
![Imgur Image](/screenshot_progetto/ricerca_2.png)


Ed ecco che python_search ritorna il risultato, che in questo test è solo uno ovviamente. Adesso se l' utente lo desidera, può notificare l' interesse per un certo maker cliccando su contatta. L' email servirà a sollecitare il maker a controllare i dati effettivamente inseriti, così da non incorrere in problemi quando il client cercherà di contattarlo.

![Imgur Image](/screenshot_progetto/ricerca_fatta.png)


Quindi parte il "flusso di autenticazione", e dando l' autorizzazione a Printable Of Things, la web app procederà a inviare una mail per conto tuo

![Imgur Image](/screenshot_progetto/oauth.png)


Ora non resta che vedere il risultato accedendo alla casella di posta!

![Imgur Image](/screenshot_progetto/mail.png)

# Conclusioni e scelte infrastrutturali

Sebbene RabbitMQ venga effettivamente chiamato in causa solo una volta, e quindi può sembrare una scelta organizzativa che cozza contro un requisito di efficienza, è comunque stato deciso di utilizzare il broker per aumentare la scalabilità del progetto. Difatti semmai dovessimo implementare in maniera migliore alcuni servizi , o aggiungerne di nuovi, sarà già disponibile come base un broker di messaggistica che compatta “l’ intranet” e permette una comunicazioni flessibile.
Un miglioramento significativo del servizio potrebbe essere apportato attraverso l’ aggiunta di “responsabilità”, quali prendere in carico una richiesta di progetto, notificando al maker di avere una nuova “offerta di lavoro”, e consegnandogli direttamente il file .stl nel caso accettasse l’ offerta.




                                                                                                            Membri del gruppo:
                                                                                                              -Leonardo Salustri
                                                                                                              -Stefano Palmieri
                                                                                                              -Leonardo Bisazza
                                                                                                              -Flaminia Papa
