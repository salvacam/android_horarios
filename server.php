<?php
/*
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
$origin=isset($_SERVER['HTTP_ORIGIN'])?$_SERVER['HTTP_ORIGIN']:$_SERVER['HTTP_HOST'];
*/

header('Content-Type: application/json');
header("access-control-allow-origin: *");

//[
//	{"linea":"SN3","nombre":"REBITES","tiempo":0},
//	{"linea":"SN2","nombre":"P. DEPORTES","tiempo":3},
//	{"linea":"SN5","nombre":"AVDA DE C\u00c1DIZ","tiempo":5},
//	{"linea":"U3","nombre":"HOSPITAL PTS","tiempo":7}
//]


/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/

//header('Access-Control-Allow-Origin: '.$origin);
/*******************************/
/*
$lista = array();

	$aux = array ('linea'=>"sn1",'nombre'=>"nombre",'tiempo'=>"2");

	$lista[] = $aux;
		$aux = array ('linea'=>"sn2",'nombre'=>"nombre",'tiempo'=>"2");

	$lista[] = $aux;
		$aux = array ('linea'=>"SN3",'nombre'=>"nombre",'tiempo'=>"2");

	$lista[] = $aux;

http_response_code(200);
echo json_encode($lista);
die();
*/
/*****************************/

if (!isset($_GET["parada"]) || empty($_GET["parada"])) {
	$rtn = array("error" => "Falta parametro de entrada");
    http_response_code(500);
    print json_encode($rtn);
	die();
}

$urlRober = "http://transportesrober.com:9055/websae/Transportes/parada.aspx?idparada=";

$parada = urlencode($_GET["parada"]);


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $urlRober . $parada);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch,CURLOPT_FOLLOWLOCATION,true);
$page = curl_exec($ch);
curl_close($ch);




//$page = file_get_contents($urlRober . $parada);


$error = strpos($page, 'No hay autobuses acerc');
if ($error > 0){
	$rtn = array("error" => "No hay bus acercandose");
    http_response_code(200);
    print json_encode($rtn);
	die();
}

$error = strpos($page, 'Se ha producido un error en la aplicaci');
if ($error > 0){
	$rtn = array("error" => "Se ha producido un error en la aplicación");
    http_response_code(200);
    print json_encode($rtn);
	die();
}

$endPos = 0;

$lista = array();
$initPos = strpos($page, 'class="tabla_campo_valor"', $endPos);
while ($initPos) {
	// Get linea
	$endPos = strpos($page, '</td>', $initPos);
	$result = substr($page, $initPos, $endPos - $initPos);

	$initPosLinea = strrpos($result, '\'>');
	$endPosLinea = strpos($result, '</a>', $initPosLinea);
	$linea = substr($result, $initPosLinea +2, $endPosLinea - ($initPosLinea + 2) );

	// Get Nombre
	$initPos = strpos($page, 'class="tabla_campo_valor"', $endPos);
	$endPos = strpos($page, '</td>', $initPos);
	$result = substr($page, $initPos, $endPos - $initPos);

	$initPosNombre = strrpos($result, '>');
	$nombre = substr($result, $initPosNombre +1);

	// Get Tiempo
	$initPos = strpos($page, 'class="tabla_campo_valor"', $endPos);
	$endPos = strpos($page, '</td>', $initPos);
	$result = substr($page, $initPos, $endPos - $initPos);

	$initPosTime = strrpos($result, '-->');
	$time = substr($result, $initPosTime +3);
	$time = (int)$time;

	$aux = array ('linea'=>$linea,'nombre'=>$nombre,'tiempo'=>$time);

	$lista[] = $aux;

	$initPos = strpos($page, 'class="tabla_campo_valor"', $endPos);
}
http_response_code(200);
echo json_encode($lista);