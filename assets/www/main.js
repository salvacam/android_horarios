document.addEventListener('DOMContentLoaded', function () {
	init();
	document.getElementById('aopcion1').addEventListener('click', aopcion1onclick);
	document.getElementById('aopcion2').addEventListener('click', aopcion2onclick);
	document.getElementById('aopcion3').addEventListener('click', aopcion3onclick);
	//document.getElementById('aopcion4').addEventListener('click', aopcion4onclick);
	document.getElementById('boton1consulta').addEventListener('click', boton1consultaonclick);
	document.getElementById('boton2consulta').addEventListener('click', boton2consultaonclick);
	document.getElementById('boton3consulta').addEventListener('click', boton3consultaonclick);
	document.getElementById('boton4consulta').addEventListener('click', boton4consultaonclick);
	
	escuchadoresRadios();
});
function aopcion1onclick() {  irapantalla(1);  }
function aopcion2onclick() {  irapantalla(2);  }
function aopcion3onclick() {  irapantalla(3);  }

function boton1consultaonclick() { favoritos(); }
function boton2consultaonclick() { irapantalla(2); mostrar(1); }
function boton3consultaonclick() { mostrar(2); }
function boton4consultaonclick() { borrarFavoritos(); }


function init() {    
    document.getElementById("divC1").style.display = "block";
	document.getElementById("divC2").style.display = "none";
	document.getElementById("divC3").style.display = "none";
	//document.getElementById("divC4").style.display = "none";

	mostrarFavoritos();
}
	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function irapantalla(p) {
	if(p==1){
		document.getElementById("divC1").style.display = "block";
		document.getElementById("divC2").style.display = "none";
		document.getElementById("divC3").style.display = "none";
		//document.getElementById("listaFavoritos").innerHTML = "en P1 ; lista de favoritos";
		mostrarFavoritos();
	}
	if(p==2){
		document.getElementById("divC1").style.display = "none";
		document.getElementById("divC2").style.display = "block";
		document.getElementById("divC3").style.display = "none";
		//document.getElementById("tablaExtraida").innerHTML = "en P2 ; tabla extraida";
	}
	if(p==3){
		document.getElementById("divC1").style.display = "none";
		document.getElementById("divC2").style.display = "none";
		document.getElementById("divC3").style.display = "block";
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
	
	window.location="index.html";
	//mostrarFavoritos();
}

function mostrarFavoritos(){
	var ul = document.getElementById('listaFavoritos');
	while (ul.firstChild) { ul.removeChild(ul.firstChild); }

	//var cadena="";
	var todasLasParadas = window.localStorage.getItem("TODASLASPARADAS");
	if (todasLasParadas != "undefined" && todasLasParadas != null && todasLasParadas != "") {
		//alert("inicio-mostrarFavoritos() [TODASLASPARADAS EXISTE] todasLasParadas="+todasLasParadas );
		var misItems = [];
		misItems = todasLasParadas.split("#");
		for(i=0; i<=misItems.length-1; i++){
			var tmpItem = misItems[i];
			var partirItem = tmpItem.split(";");
			var textoTMP = partirItem[0] + " - " + partirItem[1] ; 
			//cadena=cadena + "<BR/> &nbsp; &nbsp; <input type=button value=' "+textoTMP+"' onclick='mostrarAUX("+partirItem[0]+");return false' style='border: #ffffff 0px solid; background-color: #ffffff; color: #000000; font-size:80%; width:80%; text-align:left; '> ";
			
			var li = document.createElement('li');
			var tmpR = document.createElement('input');
    		tmpR.setAttribute('type', 'button');
    		tmpR.setAttribute('id', 'f'+i);
    		//tmpR.setAttribute('value', partirItem[0]);
    		tmpR.setAttribute('value', textoTMP);
    		//tmpR.setAttribute('onclick', "mostrarAUX('"+partirItem[0]+"');return false;");
    		tmpR.setAttribute('style', "background-color: #ffffff; color: #000000; font-size:120%; width:80%; text-align:left;");
    		var tmpText = document.createTextNode(" ");
			tmpR.appendChild(tmpText);
			li.appendChild(tmpR);
    		ul.appendChild(li);
		}
	}
	//document.getElementById("listaFavoritos").innerHTML = " <span> </span> "+cadena+" <span> </span> " ;
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
	var hora = document.getElementById('hora');
	var fecha = new Date();
	hora.textContent = "a las "+fecha.getHours()+":"+
			(fecha.getMinutes()<10?("0"+fecha.getMinutes()):fecha.getMinutes());
	if(desdedonde == 1){
		document.getElementById('parada2').value = numparada;
		//consultar('http://80.25.252.168:8080/websae/Transportes/parada.aspx?idparada='+numparada);
		//consultar('http://transportesrober.com:8080/websae/Transportes/parada.aspx?idparada='+numparada);
		consultar('http://transportesrober.com:9055/websae/Transportes/parada.aspx?idparada='+numparada);
	}else{
		//consultar('http://80.25.252.168:8080/websae/Transportes/parada.aspx?idparada='+numparada2);
		//consultar('http://transportesrober.com:8080/websae/Transportes/parada.aspx?idparada='+numparada2);
		consultar('http://transportesrober.com:9055/websae/Transportes/parada.aspx?idparada='+numparada2);
	}
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//    contactWebServer('http://80.25.252.168:8080/websae/Transportes/parada.aspx?idparada='+parada);
function contactWebServer(url) {
		    var xhr = new XMLHttpRequest({mozSystem: true});
		    
				
		    console.log();
			xhr.open("GET", url, true);
			xhr.onreadystatechange = function() {
			  if (xhr.readyState == 4) {
				  console.log(xhr.responseText);
					var tmpkk = xhr.responseText;
					//document.getElementById("tablaExtraida").innerHTML = "";
					var tmpElem = document.getElementById('tablaExtraida');
					while (tmpElem.firstChild) { tmpElem.removeChild(tmpElem.firstChild); }
					analizarYextraer(tmpkk);
			  }
			}
			xhr.send();
}
function consultar(direccion){
	//TODO: poner la imagen (con su ID) como visible.
	//document.getElementById("tablaExtraida").innerHTML = "<center>Bajando la informaci&oacute;n del servidor.<BR/><img src=loadergris.gif /></center>";
	var tmpElem = document.getElementById('tablaExtraida');
	while (tmpElem.firstChild) { tmpElem.removeChild(tmpElem.firstChild); }
	
	var tmpElem2 = document.createElement('center');
    var tmpIMG = document.createElement('img');
    tmpIMG.setAttribute('src','loadergris.gif');
    var tmpText = document.createTextNode('Bajando la información del servidor.');
	tmpElem2.appendChild(tmpText);
	tmpElem2.appendChild(document.createElement('br'));
	tmpElem2.appendChild(tmpIMG);
    tmpElem.appendChild(tmpElem2);
	
	//contactWebServer('http://80.25.252.168:8080/websae/Transportes/parada.aspx?idparada='+parada);
	contactWebServer(direccion);	
}

// http://stackoverflow.com/questions/4247838/best-way-to-parse-html-in-javascript
function analizarYextraer(html) {
    //alert("analizarYextraer() => html:["+html+"]");

	var hayBusesAcercandose = html.indexOf('No hay autobuses acerc');
	//alert("buses acercandose? "+hayBusesAcercandose);
	if( hayBusesAcercandose>0 ) {
		//document.getElementById("tablaExtraida").innerHTML = "<center>No hay autobuses acerc&aacute;ndose</center>";
		alert("No hay autobuses acercándose.");
		return;
	}

	var numparadaMal = html.indexOf('Se ha producido un error en la aplicaci');
	//alert("numparadaMal? "+numparadaMal);
	if( numparadaMal>0 ) {
		//document.getElementById("tablaExtraida").innerHTML = "<center>El n&uacute;mero de parada no es v&aacute;lido.</center>";
		alert("El número de parada no es válido.");
		return;
	}

    var startPos = html.indexOf('<table cellpadding="0" cellspacing="1" border="0" width="590" align=center>');
    //var endPos = html.indexOf('<TD width="130" align=center valign=top>');
    var endPos = html.indexOf('</table>', startPos);
    var dataLayer = html.substring(startPos, endPos);
	//alert("dataLayer:["+dataLayer+"]");
	
	//document.getElementById("tablaExtraida").innerHTML = dataLayer;
	
	dataLayer = dataLayer.replace(/<table cellpadding="0" cellspacing="1" border="0" width="590" align=center>/g, '<table cellpadding="0" cellspacing="1" border="1" width="590" align=center>');
	dataLayer = dataLayer.replace(/width="50"/g, '');
	dataLayer = dataLayer.replace(/ height="26"/g, '');
	dataLayer = dataLayer.replace(/ height="25"/g, '');
	dataLayer = dataLayer.replace(/width="70"/g, '');
	dataLayer = dataLayer.replace(/width="590"/g, '');
	dataLayer = dataLayer.replace(/onclick/g, '');
	dataLayer = dataLayer.replace(/href/g, '');
	dataLayer = dataLayer.replace(/<img src/g, '0 <kk ');
	dataLayer = dataLayer.replace(/<table cellpadding="0" cellspacing="1" border="0" width="590" align=center>/g, '<table cellpadding="0" cellspacing="1" border="1" width="590" align=center>');

	//console.log(dataLayer);
	
	//document.getElementById("tablaExtraida").innerHTML = dataLayer ;
	//alert("dataLayer:["+dataLayer+"]");
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////	
	var cadDestripado="";
	var losTR = new Array();
    losTR = dataLayer.split('<tr>');

    for(var s = 2; s < losTR.length; s++){
    	var tmp = losTR[s];
    	//alert("i="+s+"["+tmp+"]");
        startPos = tmp.indexOf('idlinea=');
        endPos = tmp.lastIndexOf("'>");
        var numBus = tmp.substring(startPos+('idlinea=').length+5, startPos+('idlinea=').length+5+3);
        numBus = numBus.replace(/</g, '');
        var tmpNumBus = numBus.split("'>");
        numBus= tmpNumBus[0];
        startPos = tmp.indexOf('flecha-->');
        endPos = tmp.lastIndexOf('');
        var minutos = tmp.substring(startPos+('flecha-->').length,startPos+('flecha-->').length+20);
        minutos=minutos.replace(/^\s+|\s+$/g, "");
        if(minutos.indexOf('kk')>0) { minutos = "0"; }
        if(minutos.length < 2) { minutos = " " + minutos; }
        cadDestripado = cadDestripado + numBus+ " \t\t\t  "+minutos+"\n";
        console.log(cadDestripado);
    }//end for
	mostrarTablaDestripada(cadDestripado);

}

function mostrarTablaDestripada(cad){
	var tmpElem = document.getElementById('tablaExtraida');
	while (tmpElem.firstChild) { tmpElem.removeChild(tmpElem.firstChild); }
	
	var tmpElem2 = document.createElement('center');
    var tmpPRE = document.createElement('pre');
	tmpPRE.appendChild( document.createTextNode('Bus  \t\t  Minutos\n') );
	tmpPRE.appendChild( document.createTextNode(cad) );
    tmpElem2.appendChild(tmpPRE);
    tmpElem.appendChild(tmpElem2);

}



function escuchadoresRadios(){
	document.getElementById('f0').addEventListener('click', favonclick);
	document.getElementById('f1').addEventListener('click', favonclick);
	document.getElementById('f2').addEventListener('click', favonclick);
	document.getElementById('f3').addEventListener('click', favonclick);
	document.getElementById('f4').addEventListener('click', favonclick);
	document.getElementById('f5').addEventListener('click', favonclick);
	document.getElementById('f6').addEventListener('click', favonclick);
	document.getElementById('f7').addEventListener('click', favonclick);
	document.getElementById('f8').addEventListener('click', favonclick);
	document.getElementById('f9').addEventListener('click', favonclick);
	document.getElementById('f10').addEventListener('click', favonclick);
	document.getElementById('f11').addEventListener('click', favonclick);
	document.getElementById('f12').addEventListener('click', favonclick);
	document.getElementById('f13').addEventListener('click', favonclick);
	document.getElementById('f14').addEventListener('click', favonclick);
	document.getElementById('f15').addEventListener('click', favonclick);
	document.getElementById('f16').addEventListener('click', favonclick);
	document.getElementById('f17').addEventListener('click', favonclick);
	document.getElementById('f18').addEventListener('click', favonclick);
	document.getElementById('f19').addEventListener('click', favonclick);
	document.getElementById('f20').addEventListener('click', favonclick);
	document.getElementById('f21').addEventListener('click', favonclick);
	document.getElementById('f22').addEventListener('click', favonclick);
	document.getElementById('f23').addEventListener('click', favonclick);
	document.getElementById('f24').addEventListener('click', favonclick);
	document.getElementById('f25').addEventListener('click', favonclick);
	document.getElementById('f26').addEventListener('click', favonclick);
	document.getElementById('f27').addEventListener('click', favonclick);
	document.getElementById('f28').addEventListener('click', favonclick);
	document.getElementById('f29').addEventListener('click', favonclick);
	document.getElementById('f30').addEventListener('click', favonclick);
	document.getElementById('f31').addEventListener('click', favonclick);
	document.getElementById('f32').addEventListener('click', favonclick);
	document.getElementById('f33').addEventListener('click', favonclick);
	document.getElementById('f34').addEventListener('click', favonclick);
	document.getElementById('f35').addEventListener('click', favonclick);
	document.getElementById('f36').addEventListener('click', favonclick);
	document.getElementById('f37').addEventListener('click', favonclick);
	document.getElementById('f38').addEventListener('click', favonclick);
	document.getElementById('f39').addEventListener('click', favonclick);
	document.getElementById('f40').addEventListener('click', favonclick);
}
function favonclick(e){
	var thing;
	var valxx;
    if (window.event) {
      thing = window.event.srcElement;
    } else {
      thing = e.target;
    }
    console.log(thing);

	//alert("R=["+e+"]  ["+thing.value+"]");
	var tmpItem = thing.value
	var partirItem = tmpItem.split(" - ");
	//var textoTMP = partirItem[0] + " - " + partirItem[1] ;
	console.log(partirItem[0]);	
	mostrarAUX( partirItem[0] );
}
