<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "andrea_db";

// Crea la connessione al database
$conn = new mysqli($servername, $username, $password, $dbname);
// Controlla la connessione
if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

//aggiungere form ricerca





$conn->close();

echo 'vuoi tornare alla home?';

//fare qualcosa per tornare alla home