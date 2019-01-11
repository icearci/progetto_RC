<html>
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

//inserisce i dati dal form html con il metodo post
$sql = "INSERT INTO Utenti (nome, cognome, email, indirizzo, citta, telefono, macchinario, nome_macchinario, id_macchinario, prezzo_ora, spedizione, consegna) VALUES"
. " ('$_POST[varnome]','$_POST[varcognome]','$_POST[varemail]','$_POST[varindirizzo]','$_POST[varcitta]','$_POST[vartelefono]','$_POST[stampantetipo]','$_POST[stampantenome]','$_POST[stampanteid]','$_POST[stampanteprezzo]','$_POST[varspedizione]','$_POST[varconsegna]')";

if ($conn->query($sql) === TRUE) {
    echo "Nuovo record creato con successo!  ";
    
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}


/*
//carica i dati dal database e li scrive in ordine di id
$sql = "SELECT id, nome, cognome, email, indirizzo FROM Utenti";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output dati riga per riga del database
    while($row = $result->fetch_assoc()) {
        echo "<br> id: ". $row["id"]. " - Nome: ". $row["nome"]. " " . $row["cognome"] . 
        " - Email: ". $row["email"] . " - Indirizzo: ". $row["indirizzo"] . "<br>";
                
    }
} else {
    echo "0 results";
}
*/




//chiude la connessione al database
$conn->close();

?>
    <a  href="../paginaHome.3/homenew.html">[clicca qui se non vieni automaticamente reindirizzato]</a>
    <meta http-equiv="refresh" content="2; URL=../paginaHome.3/homenew.html">
    <meta name="keywords" content="automatic redirection">
</html>





