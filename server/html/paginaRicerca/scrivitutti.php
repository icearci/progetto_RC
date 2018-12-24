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

//carica i dati dal database e li scrive in ordine di id
$sql = "SELECT id, nome, cognome, email, indirizzo, stampante3D, laser FROM utenti";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output dati riga per riga del database
    while($row = $result->fetch_assoc()) {
        echo "<br> Nome: ". $row["nome"]. " " . $row["cognome"] . " - Email: ". $row["email"] . " - Indirizzo: ". $row["indirizzo"] . "" . ""
        . " - Stampante 3D: ". $row["stampante3D"] . " - Taglierina laser: ". $row["laser"] . "<br>";
                
    }
} else {
    echo "0 results";
}

echo "<br><br><br>";
echo "Vuoi stampare?";

// fare qualcosa per stampare!

echo "<br><br><br>";
echo "Vuoi tornare alla pagina home?";

// fare qualcosa per tornare alla nome page?

//chiude il collegamento
$conn->close();

?>

