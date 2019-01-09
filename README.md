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
 - backend database --> CouchDB
 
# Servizi principali
 L' idea del sito è quella di interconnettere (o meglio far conoscere) due persone, un client e un maker. Per maker si intende una persona fisica che possiede stampanti 3d o altri sistemi di produzione di prodotti 3d 
 e li mette a disposizione del cliente attraverso il nostro sito.
 D' ora in poi ci riferiremo ai servizi con i nomi utilizzati nel docker-compose.
 Il servizio fornisce tramite una autenticazione minimale implementata dal server "server", che si occupa anche del trasferimento di tutte le pagine html richieste dal client.
 Senza autenticazione un cliente può solamente visitare pagine statiche, mentre eseguendo il login, sarà possibile accedere ai vari servizi che offriamo al cliente:
  - /profilo redirige alla pagina in cui sono reperite tutte le informazioni dal database, incluse le stampanti. Qui è possibile eliminare stampanti.
  - /aggiungi_stampante redirige alla pagina in cui è possibile (per un utente loggato) inserire nuove stampanti compilando la form. Viene effettuato il controllo sull' utente inserito.
  - /search si occupa dell' effettiva ricerca da parte di un cliente loggato di stampanti 3d che sono conformi ai requisiti da lui imposti, quali prezzo orario, tipologia, etc... In particolare vi sarà un server diverso da "server" 
     implementato in flask, che prenderà in carico le post a /python_search, contenenti le info della ricerca, e che effettuerà chiamate REST a MapQuest per ritornare i risultati più vicini (se l' utente ha scelto il ritiro presso il          maker), altrimenti verranno ritornati tutti i maker che si fanno carico della spedizione. Da qui un possessore di un account Gmail potrà inviare una mail automatica che notifichi l' interesse al maker, sollecitandolo di controllare      le informazioni della sua stampante.
