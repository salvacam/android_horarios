
var deviceInfo = function() {
};

function init() {
    document.addEventListener("deviceready", deviceInfo, true);	
    
    document.getElementById("divC1").style.display = "block";
	document.getElementById("divC2").style.display = "none";
	document.getElementById("divC3").style.display = "none";
	document.getElementById("divC4").style.display = "none";

	mostrarFavoritos();
}
	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function irapantalla(p) {
	if(p==1){
		document.getElementById("divC1").style.display = "block";
		document.getElementById("divC2").style.display = "none";
		document.getElementById("divC3").style.display = "none";
		document.getElementById("divC4").style.display = "none";
		//document.getElementById("listaFavoritos").innerHTML = "en P1 ; lista de favoritos";
		mostrarFavoritos();
	}
	if(p==2){
		document.getElementById("divC1").style.display = "none";
		document.getElementById("divC2").style.display = "block";
		document.getElementById("divC3").style.display = "none";
		document.getElementById("divC4").style.display = "none";
		//document.getElementById("tablaExtraida").innerHTML = "en P2 ; tabla extraida";
	}
	if(p==3){
		document.getElementById("divC1").style.display = "none";
		document.getElementById("divC2").style.display = "none";
		document.getElementById("divC3").style.display = "block";
		document.getElementById("divC4").style.display = "none";
	}
	if(p==4){
		document.getElementById("divC1").style.display = "none";
		document.getElementById("divC2").style.display = "none";
		document.getElementById("divC3").style.display = "none";
		document.getElementById("divC4").style.display = "block";
	}
} 

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function favoritos(){
	var yaEsta=0;
	var parada=document.getElementById('parada').value;
	if( ! parada.match(/^[0-9]+$/) ){
		alert('Aviso: Introduzca el número de parada');
		return;
	}

	var todasLasParadas = window.localStorage.getItem("TODASLASPARADAS");
	if (todasLasParadas != "undefined" && todasLasParadas != null) {
		//alert("inicio-favoritos() [TODASLASPARADAS EXISTE] todasLasParadas="+todasLasParadas );
		var misItems = [];
		misItems = todasLasParadas.split("#");
		for(i=0; i<=misItems.length-1; i++){
			var tmpItem = misItems[i];
			var partirItem = tmpItem.split(";");
			if( partirItem[0].indexOf( parada ) != -1){  //coincide
				yaEsta=1;
			}
		}
	}
	
	if( ! yaEsta ){
		//alert("no estaba aún");
		// si NO existe aún, SÍ hay que añadirla al listado general
		// pedir una descripción con un prompt
		var descripcionparada = prompt("Descripción de la parada","");
		descripcionparada = descripcionparada.replace(/#/g, '-');
		descripcionparada = descripcionparada.replace(/;/g, ',');
		
		if (todasLasParadas != "" && todasLasParadas != "undefined" && todasLasParadas != null) {
			todasLasParadas = todasLasParadas + "#" + parada+";"+descripcionparada;
		}else{
			todasLasParadas = parada+";"+descripcionparada;
		}
	}else{
		alert("Este número de parada ya lo tienes entre los favoritos.");
	}
	
	window.localStorage.setItem("TODASLASPARADAS", todasLasParadas);
	//document.getElementById("listaFavoritos").innerHTML = "<center>"+todasLasParadas+"</center>";
	//alert("fin-favoritos() -> todasLasParadas="+todasLasParadas );
	
	mostrarFavoritos();
}

function mostrarFavoritos(){
	var cadena="";
	var todasLasParadas = window.localStorage.getItem("TODASLASPARADAS");
	if (todasLasParadas != "undefined" && todasLasParadas != null && todasLasParadas != "") {
		//alert("inicio-mostrarFavoritos() [TODASLASPARADAS EXISTE] todasLasParadas="+todasLasParadas );
		var misItems = [];
		misItems = todasLasParadas.split("#");
		for(i=0; i<=misItems.length-1; i++){
			var tmpItem = misItems[i];
			var partirItem = tmpItem.split(";");
			var textoTMP = partirItem[0] + " - " + partirItem[1] ; 
			cadena=cadena + "<BR/> &nbsp; &nbsp; <input type=button value=' "+textoTMP+"' onclick='mostrarAUX("+partirItem[0]+");return false' style='border: #ffffff 0px solid; background-color: #ffffff; color: #000000; font-size:90%; width:100%; text-align:left; '> ";
		}
	}
	document.getElementById("listaFavoritos").innerHTML = cadena ;
}


function borrarFavoritos(){
	window.localStorage.setItem("TODASLASPARADAS", "");
	//document.getElementById("listaFavoritos").innerHTML = "";
	alert("Los datos de favoritos almacenados se han borrado definitivamente.");
}

function mostrarAUX(cual){
	document.getElementById('parada').value = cual;
	document.getElementById('parada2').value = cual;
	irapantalla(2);
	mostrar(1); //la llamamos desde la lista en p1
}
function mostrar(desdedonde){
	var numparada = document.getElementById('parada').value;
	var numparada2 = document.getElementById('parada2').value;
	if(desdedonde == 1){
		document.getElementById('parada2').value = numparada;
		consultar('http://80.25.252.168:8080/websae/Transportes/parada.aspx?idparada='+numparada);
	}else{
		consultar('http://80.25.252.168:8080/websae/Transportes/parada.aspx?idparada='+numparada2);
	}
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//    contactWebServer('http://80.25.252.168:8080/websae/Transportes/parada.aspx?idparada='+parada);
function contactWebServer(url) {
			xmlhttp=new XMLHttpRequest();
			xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState==4 && (xmlhttp.status==200 || xmlhttp.status==0)) {
					var tmpkk = xmlhttp.responseText;
					document.getElementById("tablaExtraida").innerHTML = "";
					//alert("contactWebServer()=>tmpkk"+tmpkk);
					analizarYextraer(tmpkk);
				}
			}
			xmlhttp.open("GET",url,true);
			xmlhttp.send();
}

function consultar(direccion){
	document.getElementById("tablaExtraida").innerHTML = "<center>Bajando la informaci&oacute;n del servidor.<BR/><img src=loadergris.gif /></center>";
	
	//contactWebServer('http://80.25.252.168:8080/websae/Transportes/parada.aspx?idparada='+parada);
	contactWebServer(direccion);	
}

// http://stackoverflow.com/questions/4247838/best-way-to-parse-html-in-javascript
function analizarYextraer(html) {
    //alert("analizarYextraer() => html:["+html+"]");

	var hayBusesAcercandose = html.indexOf('No hay autobuses acerc');
	//alert("buses acercandose? "+hayBusesAcercandose);
	if( hayBusesAcercandose>0 ) {
		document.getElementById("tablaExtraida").innerHTML = "<center>No hay autobuses acerc&aacute;ndose</center>";
		return;
	}

	var numparadaMal = html.indexOf('Se ha producido un error en la aplicaci');
	//alert("numparadaMal? "+numparadaMal);
	if( numparadaMal>0 ) {
		document.getElementById("tablaExtraida").innerHTML = "<center>El n&uacute;mero de parada no es v&aacute;lido.</center>";
		return;
	}

    var startPos = html.indexOf('<table cellpadding="0" cellspacing="1" border="0" width="590" align=center>');
    var endPos = html.indexOf('<TD width="130" align=center valign=top>');
    var dataLayer = html.substring(startPos, endPos);
	//alert("dataLayer:["+dataLayer+"]");
	
	//document.getElementById("tablaExtraida").innerHTML = dataLayer;
	
	dataLayer = dataLayer.replace(/<table cellpadding="0" cellspacing="1" border="0" width="590" align=center>/g, '<table cellpadding="0" cellspacing="1" border="1" width="590" align=center>');
	dataLayer = dataLayer.replace(/width="50"/g, '');
	dataLayer = dataLayer.replace(/width="70"/g, '');
	dataLayer = dataLayer.replace(/width="590"/g, '');
	dataLayer = dataLayer.replace(/onclick/g, '');
	dataLayer = dataLayer.replace(/href/g, '');
	dataLayer = dataLayer.replace(/<img src/g, '0 <kk ');
	dataLayer = dataLayer.replace(/<table cellpadding="0" cellspacing="1" border="0" width="590" align=center>/g, '<table cellpadding="0" cellspacing="1" border="1" width="590" align=center>');

	document.getElementById("tablaExtraida").innerHTML = dataLayer;
	//alert("dataLayer:["+dataLayer+"]");	
}

