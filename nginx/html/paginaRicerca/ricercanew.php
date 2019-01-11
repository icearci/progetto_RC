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

//seleziona tutti i campi dalla tabella utenti
$sql = "SELECT * FROM utenti";

if( isset($_POST['ricerca']) ){
 if( isset($_POST['stampantetipo']) ){
  if( isset($_POST['vartipospedizione']) ){
     
    $citta = mysqli_real_escape_string($conn, htmlspecialchars($_POST['ricerca']));
    $macchinario = mysqli_real_escape_string($conn, htmlspecialchars($_POST['stampantetipo']));
    $tipospedizione = mysqli_real_escape_string($conn, htmlspecialchars($_POST['vartipospedizione']));
    if($tipospedizione == "manocitta"){
        $sql = "SELECT * FROM utenti WHERE citta ='$citta' AND macchinario = '$macchinario' AND (consegna = 'citta' OR consegna = 'zona')";
    }
    if($tipospedizione == "ita"){
        $sql = "SELECT * FROM utenti WHERE (spedizione ='italia' OR spedizione ='internazionale') AND macchinario = '$macchinario'";
    }
    if($tipospedizione == "int"){
        $sql = "SELECT * FROM utenti WHERE spedizione ='internazionale' AND macchinario = '$macchinario'";
    }
  }    
 }
}

$result = $conn->query($sql);
?>




<!--
spiegare il funzionamento del file
-->
<html>
    <head>
        <title>Rete dei Maker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../responsive_css/responsive.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css">

        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css'>
      
        <link rel="stylesheet" type="text/css" media="screen" href="css/style.css" />
      
      
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prefixfree/1.0.7/prefixfree.min.js"></script>
      
    </head>
    <body>
            <!--nav bar-->
    <div class="navbar">

            <a  href="../paginaHome.3/homenew.html">
                Home</a>
              <a href="../paginaImmissione/immissionenew.html">
                Aggiungi le tue macchine</a>
        <a class="active"  href="../paginaRicerca/ricercanew.php">
                Cerca un maker</a>
              <a href="../visore3d/visore3d.html">Visore 3D</a>
              <a href="../paginaTecnologie/tecnologie.html">Tecnologie</a>
              <a href="../paginaNews/news.html">News</a>
              <!--fancy 3d log in form-->
              <!-- <a class= "right" href="../paginaRegistrati/reg_3d/index.html">
                  Register / Log in</a> -->
                  <!--oppure quella classica-->
              <a class= "right" href="../paginaRegistrati/index.html">
                  Register / Log in</a>
              <a class="right" href="../paginaFAQ/Faq.html">
                      FAQ</a>
              <a class="right" href="../paginaChiSiamo/chi_siamonew.html">
                Chi siamo</a>
              <a class="right" href="../paginaProfilo/Profilo.html">
                  Profilo</a>
        </div>
    
            <!--immissione form di leo-->
            <form action="" method="post">
                
            <div class="container">

                <!--text inputs-->
                <div class="row">
                        <h1> Form Ricerca Maker</h1>
                        <div class="col-group col-sm-12">
                            <h1>User Data</h1>
                            <div class="row">
                               
                                <div class="col-sm-6">
                                    <span class="input-desc">City</span>
                                    <label class="text-data">
                                        <input type="text" name="ricerca" class="text-data"/ placeholder="Rome">
                                    </label>
                                </div>
                            </div>
                            <div class="row">      
                                
                            </div>                                
                         </div>                       
                         <div class="col-group col-sm-6">
                <span class="input-desc ">Metodo di spedizione</span>
                <label class="control control--checkbox">
                    <input type="radio" name="vartipospedizione" value="manocitta"/>
                    <span class="control--label">consegna a mano</span>
                    <div class="control--indicator"></div>
                    <div class="control--fill"></div>
                    <div class="help"></div>
                    <div class="help--tooltip">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus condimentum scelerisque. Donec feugiat velit.<br><br>Tooltips can have <a href="#">links</a>, <font color=red size=3em>and</font> <b>formatting</b> <u>if</u> <i>needed</i>.
                    </div>
                    
                </label>
                <label class="control control--checkbox">
                    <input type="radio" name="vartipospedizione" value="ita" checked="checked"/>
                    <span class="control--label">spedizione in Italia</span>
                    <div class="control--indicator"></div>
                    <div class="control--fill"></div>
                    <div class="help"></div>
                    <div class="help--tooltip">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus condimentum scelerisque. Donec feugiat velit.<br><br>Tooltips can have <a href="#">links</a>, <font color=red size=3em>and</font> <b>formatting</b> <u>if</u> <i>needed</i>.
                    </div>
                </label>
                <label class="control control--checkbox">
                    <input type="radio" name="vartipospedizione" value="int" checked="checked"/>
                    <span class="control--label">spedizione internazionale</span>
                    <div class="control--indicator"></div>
                    <div class="control--fill"></div>
                    <div class="help"></div>
                    <div class="help--tooltip">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus condimentum scelerisque. Donec feugiat velit.<br><br>Tooltips can have <a href="#">links</a>, <font color=red size=3em>and</font> <b>formatting</b> <u>if</u> <i>needed</i>.
                    </div>
                </label>
                     </div>
                    
                <!--radio inputs-->
                <div class="row">
                   
                    <!--Printer Informations-->
                    <div class="col-group col-sm-6">
                        <h1>FDM Printer Informations</h1>
                            
                            <span class="input-desc req">Which one of these applies to you?</span>
                            <label class="control control--radio">
                                <input type="radio" name="stampantetipo" value="fdm_professionale" />
                                <span class="control--label">Professionale</span>
                                <div class="control--indicator"></div>
                                <div class="control--fill"></div>
                                <div class="help"></div>
                                    <div class="help--tooltip">
                                        Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                    </div>
                            </label>
                            
                            <label class="control control--radio">
                                <input type="radio" name="stampantetipo" value="fdm_semipro"/>
                                <span class="control--label">Semipro</span>
                                <div class="control--indicator"></div>
                                <div class="control--fill"></div>
                                <div class="help"></div>
                                <div class="help--tooltip">
                                    Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                </div>
                            </label>
                            <label class="control control--radio">
                                <input type="radio" name="stampantetipo" value="fdm_amatoriale"/>
                                <span class="control--label">Amatoriale</span>
                                    <div class="control--indicator"></div>
                                    <div class="control--fill"></div>
                                    <div class="help"></div>
                                    <div class="help--tooltip">
                                        Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                    </div>
                                </label>
                                <!--<label class="control control--radio">
                                        <input type="radio" name="stampantetipo" checked="checked"/>
                                        <span class="control--label">Nessuna</span>
                                        <div class="control--indicator"></div>
                                        <div class="control--fill"></div>
                                        <div class="help"></div>
                                        <div class="help--tooltip">
                                            Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                        </div>
                                    </label>-->
                            
                    </div>
                    <!--laser-->  
                    <div class="col-group col-sm-6">
                            <h1> SLA Printer informations</h1>
                            <span class="input-desc req">Which one of these applies to you?</span>
                            <label class="control control--radio">
                                <input type="radio" name="stampantetipo" value="sla_modellismo"/>
                                <span class="control--label">Modellismo</span>
                                <div class="control--indicator"></div>
                                <div class="control--fill"></div>
                                <div class="help"></div>
                                    <div class="help--tooltip">
                                        Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                    </div>
                            </label>
                            
                            <label class="control control--radio">
                                <input type="radio" name="stampantetipo" value="sla_dentale"/>
                                <span class="control--label">Dentale</span>
                                <div class="control--indicator"></div>
                                <div class="control--fill"></div>
                                <div class="help"></div>
                                <div class="help--tooltip">
                                    Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                </div>
                            </label>
                            <label class="control control--radio">
                                    <input type="radio" name="stampantetipo" value="sla_oreficeria"/>
                                    <span class="control--label">Oreficeria</span>
                                    <div class="control--indicator"></div>
                                    <div class="control--fill"></div>
                                    <div class="help"></div>
                                    <div class="help--tooltip">
                                        Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                    </div>
                                </label>
                                <!--<label class="control control--radio">
                                        <input type="radio" name="stampantetipo"checked="checked"/>
                                        <span class="control--label">Nessuna</span>
                                        <div class="control--indicator"></div>
                                        <div class="control--fill"></div>
                                        <div class="help"></div>
                                        <div class="help--tooltip">
                                            Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                        </div>
                                    </label>-->
                            
                        </div>
                    <!--laser-->  
                    <div class="col-group col-sm-6">
                        <h1> Laser cutter Informations</h1>
                        <span class="input-desc req">Which one of these applies to you?</span>
                        <label class="control control--radio">
                            <input type="radio" name="stampantetipo" value="lsr_legni"/>
                            <span class="control--label">Legni e Plastiche</span>
                            <div class="control--indicator"></div>
                            <div class="control--fill"></div>
                            <div class="help"></div>
                                <div class="help--tooltip">
                                    Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                </div>
                        </label>
                        
                        <label class="control control--radio">
                            <input type="radio" name="stampantetipo" value="lsr_plexiglass"/>
                            <span class="control--label">Plexiglass e simili</span>
                            <div class="control--indicator"></div>
                            <div class="control--fill"></div>
                            <div class="help"></div>
                            <div class="help--tooltip">
                                Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                            </div>
                        </label>
                        <label class="control control--radio">
                                <input type="radio" name="stampantetipo" value="lsr_metalli"/>
                                <span class="control--label">Metalli e Vetro</span>
                                <div class="control--indicator"></div>
                                <div class="control--fill"></div>
                                <div class="help"></div>
                                <div class="help--tooltip">
                                    Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                </div>
                            </label>
                            <!--<label class="control control--radio">
                                    <input type="radio" name="stampantetipo"checked="checked"/>
                                    <span class="control--label">Nessuna</span>
                                    <div class="control--indicator"></div>
                                    <div class="control--fill"></div>
                                    <div class="help"></div>
                                    <div class="help--tooltip">
                                        Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                    </div>
                                </label>-->
                        
                    </div>
                    <!--cnc-->
                    <div class="col-group col-sm-6">
                        <h1>CNC Informations</h1>
                        <span class="input-desc req">Which one of these applies to you?</span>
                        <label class="control control--radio">
                            <input type="radio" name="stampantetipo" value="cnc_legni_morbidi"/>
                            <span class="control--label">Legni morbidi</span>
                            <div class="control--indicator"></div>
                            <div class="control--fill"></div>
                            <div class="help"></div>
                                <div class="help--tooltip">
                                    Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                </div>
                        </label>
                        
                        <label class="control control--radio">
                            <input type="radio" name="stampantetipo" value="cnc_legni_duri"/>
                            <span class="control--label">Legni duri</span>
                            <div class="control--indicator"></div>
                            <div class="control--fill"></div>
                            <div class="help"></div>
                            <div class="help--tooltip">
                                Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                            </div>
                        </label>
                        <label class="control control--radio">
                                <input type="radio" name="stampantetipo" value="cnc_alluminio"/>
                                <span class="control--label">Alluminio</span>
                                <div class="control--indicator"></div>
                                <div class="control--fill"></div>
                                <div class="help"></div>
                                <div class="help--tooltip">
                                    Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                </div>
                            </label>
                            <label class="control control--radio">
                                <input type="radio" name="stampantetipo" value="cnc_metalli"/>
                                <span class="control--label">Metalli</span>
                                <div class="control--indicator"></div>
                                <div class="control--fill"></div>
                                <div class="help"></div>
                                <div class="help--tooltip">
                                    Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                </div>
                            </label>
                        <!-- <label class="control control--radio">
                                    <input type="radio" name="stampantetipo" checked="checked"/>
                                    <span class="control--label">Nessuna</span>
                                    <div class="control--indicator"></div>
                                    <div class="control--fill"></div>
                                    <div class="help"></div>
                                    <div class="help--tooltip">
                                        Cras blandit ex eu pharetra rutrum. Maecenas placerat lectus eu magna congue, sed mattis metus egestas. Vivamus viverra dictum risus in ornare. Integer sed massa eros. Mauris ex enim, suscipit at nulla quis, consectetur finibus lorem. Phasellus non sem orci. Cras lacinia lorem eu massa congue, vel vehicula ipsum hendrerit.
                                    </div>
                                </label>-->
                        
                    </div>
                    <!--info stampante-->
                    
                                
                                
                    
                </div>
                <!--info stampante-->

                <!--buttons-->
                <div class="row right" >
                        <div class="col-group col-sm-12">
                            
                            <div class="row">
                                <div class="col-sm-12">
                                    
                                    <button type="submit" class="button btn btn-default right">Submit
                                        <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                                    </button>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                
            </div>
            </form>


            
<table id="tabella">
<tr>
<!--<th>ID</th>-->
<th>Nome</th>
<th>Cognome</th>
<th>Indirizzo</th>
<th>Citta'</th>
<th>consegna</th>
<th>Email</th>
<th>telefono</th>
<th>Macchinario</th>
<th>nome macchina</th>
<th>costo-ora</th>


</tr>

<?php
while($row = $result->fetch_assoc()){
?>

    <tr>
    <td><?php echo $row['nome']; ?></td>
    <td><?php echo $row['cognome']; ?></td>
    <td><?php echo $row['indirizzo']; ?></td>
    <td><?php echo $row['citta']; ?></td>
    <td><?php echo $row['consegna']; ?></td>
    <td><?php echo $row['email']; ?></td>
    <td><?php echo $row['telefono']; ?></td>
    <td><?php echo $row['macchinario']; ?></td>
    <td><?php echo $row['nome_macchinario']; ?></td>
    <td><?php echo $row['prezzo_ora']; ?></td>
    
    </tr>

<?php
}
$conn->close();
?>

</table>
            
            <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js'></script>
            <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery.maskedinput/1.4.1/jquery.maskedinput.min.js'></script>
            <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery-tagsinput/1.3.6/jquery.tagsinput.min.js'></script>
        
            
        
                <script  src="js/index.js"></script>
        </body>
</html>
