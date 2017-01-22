document.addEventListener('DOMContentLoaded', function () {
  app.inicio();
});

var app = {

  //URL_SERVER: 'index.php?parada=',
  //URL_SERVER: 'http://192.168.1.133/horarios/_index.php?parada=',
  //URL_SERVER: 'http://transportesrober.com:9055/websae/Transportes/parada.aspx?idparada=',
  URL_SERVER: 'https://salvacam.net78.net/horarios/index.php?parada=',
  //
  conterDescripcion: document.getElementById("conter-descripcion"),
  cancelar: document.getElementById('cancelar'),
  guardar: document.getElementById('guardar'),

  todasParadas: [],


  botonConsulta: document.getElementById('botonConsulta'),
  cargando: document.getElementById('cargando'),
  botonAdd: document.getElementById('botonAdd'),
  operacion: document.getElementById('operacion'),
  hora: document.getElementById('hora'),
  tablaResultado: document.getElementById('tablaResultado'),
  cabeceraTabla: document.getElementById('cabeceraTabla').classList,
  botonesFavoritos: document.querySelector('.parada'),

  inicio: function() {

    app.botonConsulta.addEventListener('click', app.mostrar);
    
    app.botonAdd.addEventListener('click', app.addBookmark);

    //Mostrar favoritos
    if(localStorage.getItem('_horarios_paradas')) {
      app.todasParadas = JSON.parse(localStorage.getItem('_horarios_paradas'));
    }
    app.mostrarFavoritos();

    //TODO cargar serviceWorker
    //alert('service worker');
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('service-worker.js')
        .then(function() { 
          //console.log('Service Worker Registered'); 
        });
    }

     
  },

  mostrarFavorito: function(e) {
    //console.log(e);
    document.getElementById("parada").value = e.target.getAttribute('data-id');
    app.mostrar();
  },

  mostrar: function() {
    alert('mostrar');
    app.cancelAdd();
    var numparada = document.getElementById("parada").value;
    alert(numparada);
    if (numparada === "") {
      //TODO poner mensaje "debes introducir un número de parada"
      //console.log("debes introducir un número de parada");
      return;
    }

    //Desactivar boton consultar y quitar evento
    app.botonConsulta.classList.toggle('disabled');
    document.querySelector('.parada').classList.toggle('disabled');
    app.botonConsulta.removeEventListener('click', app.mostrar);

    cargando.classList.toggle('hide');

    var url = app.URL_SERVER + numparada;
    console.log(url);
    alert(url);

    var xhr = new XMLHttpRequest();
    
    xhr.open ("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        alert(xhr.responseText);
        if (xhr.responseText) {
          var data = JSON.parse(xhr.responseText);
          alert(data);
          app.renderResult(data, numparada);
        }        
      }
    };
    xhr.send(null);
    alert(xhr);
  },

  renderResult: function(data, numparada) {
    alert('renderResult');
    app.botonConsulta.classList.toggle('disabled');
    app.botonConsulta.addEventListener('click', app.mostrar);

    app.cargando.classList.toggle('hide');
    document.querySelector('.parada').classList.toggle('disabled');

    if (data.hasOwnProperty("error")){
      operacion.textContent = data.error;
      return false;
    }

    if (data.length < 1) {
      operacion.textContent = "No hay bus acercandose";
      return false;
    }

    app.operacion.textContent = "";

    var fecha = new Date();
    //hora.textContent = "Datos de la parada " + numparada + ", consultados a las "+fecha.getHours()+":"+
    app.hora.textContent = "Parada " + numparada + ", a las "+fecha.getHours()+":"+
        (fecha.getMinutes()<10?("0"+fecha.getMinutes()):fecha.getMinutes());

    //Remove content of tablaResultado
    //TODO crear function
    while(app.tablaResultado.firstChild) app.tablaResultado.removeChild(app.tablaResultado.firstChild);

    app.cabeceraTabla.remove('hide');
    document.getElementById('resultado').className = "";

    document.getElementById('limpiar').removeEventListener('click', function(){});
    document.getElementById('limpiar').addEventListener('click', function(){
      document.getElementById('resultado').className = "hide";
    });

    data.forEach(function(item) {
      //console.log(item);
      var tr = (document.createElement('tr'));
      for(var x in item){
        var td = (document.createElement('td'));
        td.textContent = item[x];
        tr.appendChild(td);
        //console.log(item[x]);
      }

      app.tablaResultado.appendChild(tr);
    });
  },

  addBookmark: function() {
    
    var numparada = document.getElementById("parada").value;

    //Mostrar Input descripcion    
    app.conterDescripcion.className = '';
    
    cancelar.addEventListener('click', app.cancelAdd);
    
    guardar.addEventListener('click', app.saveAdd);
  },

  cancelAdd: function() {
    document.getElementById('descripcion').value = '';
    app.conterDescripcion.className = 'hide';
  },

  saveAdd: function(){
    var numparada = document.getElementById("parada").value;
    var valorDescription = document.getElementById('descripcion').value;
    var item = {Order: 1, Number: numparada, Descripcion: valorDescription};

    app.todasParadas.push(item);

    localStorage.setItem('_horarios_paradas', JSON.stringify(app.todasParadas));
    
    app.cancelAdd();

    // Actualizar favoritos
    app.mostrarFavoritos();
  },

  deleteAdd: function(e) {
    app.cancelAdd();
    var confirmarBorrar = confirm("Borrar la parada " + e.target.getAttribute('data-id') + " - " + 
      e.target.getAttribute('data-desc'));
    if (confirmarBorrar) {
      //localStorage.removeItem('_horarios_paradas');
      var paradasExistentes = app.todasParadas;
      app.todasParadas = [];
      //recorrer el array 
      for(var x in paradasExistentes) {
        console.log(x);
        if(paradasExistentes[x].Number != e.target.getAttribute('data-id') 
            || paradasExistentes[x].Descripcion != e.target.getAttribute('data-desc')) {
          app.todasParadas.push(paradasExistentes[x]);
        }
      }

      localStorage.setItem('_horarios_paradas', JSON.stringify(app.todasParadas));
      
      app.mostrarFavoritos();
    }    
  },

  editAdd: function() {
    app.cancelAdd();

  },

  deleteBookmark: function() {
    app.cancelAdd();
    var confirmarBorrar = confirm("Borrar todos las paradas");
    if (confirmarBorrar) {
      localStorage.removeItem('_horarios_paradas');
      app.todasParadas = [];
      app.mostrarFavoritos();
    }    
  },

  mostrarFavoritos: function(){
    var listaFavoritos = document.getElementById('lista-favoritos');
    
    //TODO crear function
    while(listaFavoritos.firstChild) listaFavoritos.removeChild(listaFavoritos.firstChild);

    app.todasParadas.forEach(function(parada) {
      console.log(parada);
      
      //<i class="fa fa-long-arrow-down" aria-hidden="true"></i>
      //<i class="fa fa-long-arrow-up" aria-hidden="true"></i>
      
      var item = document.createElement('span');
      item.className = "parada btn btn-default btn-lg";
      item.setAttribute('data-id', parada.Number);

      var newContent = document.createTextNode(parada.Number + " - \x09" + parada.Descripcion);
      item.appendChild(newContent);

      listaFavoritos.appendChild(item);
      
      item.addEventListener('click', app.mostrarFavorito);

      var iconoBorrar = document.createElement('i');
      iconoBorrar.className = "borrar fa fa-trash-o btn btn-default fa-2x";
      iconoBorrar.setAttribute('aria-hidden', true);
      iconoBorrar.setAttribute('data-id', parada.Number);
      iconoBorrar.setAttribute('data-desc', parada.Descripcion);

      iconoBorrar.addEventListener('click', app.deleteAdd);

      listaFavoritos.appendChild(iconoBorrar);

      //<i class="fa fa-pencil" aria-hidden="true"></i>

      var salto = document.createElement('div');
      salto.className = "salto";
      listaFavoritos.appendChild(salto);
    });

    if(app.todasParadas.length > 0) {

      var iconoBorrarTodo = document.createElement('i');
      iconoBorrarTodo.className = "fa fa-trash btn btn-default fa-2x btn-lg";
      iconoBorrarTodo.setAttribute('aria-hidden', true);
      iconoBorrarTodo.setAttribute('id', 'borrar-todo');

      listaFavoritos.appendChild(iconoBorrarTodo);

      iconoBorrarTodo.addEventListener('click', app.deleteBookmark);
    }

  }
}