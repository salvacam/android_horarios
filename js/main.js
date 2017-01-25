document.addEventListener('DOMContentLoaded', function () {
  app.inicio();
});

var app = {

  //URL_SERVER: 'index.php?parada=',
  //URL_SERVER: 'http://transportesrober.com:9055/websae/Transportes/parada.aspx?idparada=',
  URL_SERVER: 'https://featherbrained-exec.000webhostapp.com/horarios/index.php?parada=',

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
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('service-worker.js')
        .then(function() {
          //console.log('Service Worker Registered'); 
        });
    }
  },

  mostrarFavorito: function(e) {

    document.getElementById("parada").value = e.target.getAttribute('data-id');
    app.mostrar();
  },

  mostrar: function() {
    var numparada = document.getElementById("parada").value;
    if (numparada === "") {
      alertify.alert("Debes introducir un número de parada");
      return;
    }

    //Desactivar boton consultar y quitar evento
    app.botonConsulta.classList.toggle('disabled');
    document.querySelector('.parada').classList.toggle('disabled');
    app.botonConsulta.removeEventListener('click', app.mostrar);
    document.querySelector('.parada').removeEventListener('click', app.mostrarFavorito);

    cargando.classList.toggle('hide');

    var url = app.URL_SERVER + numparada;
    
    var xhr = new XMLHttpRequest();
    
    xhr.open ("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          var data = JSON.parse(xhr.responseText);
          app.renderResult(data, numparada);
        } else {
          app.fn_errorXHR();
        }
      }
    };

    try{
      xhr.send(null);
    }catch(err){
      app.fn_errorXHR();
    }
  },

  fn_errorXHR: function() {
    alertify.alert("Error al obtener los datos, compruebe su conexión");
    app.botonConsulta.classList.toggle('disabled');
    document.querySelector('.parada').classList.toggle('disabled');

    app.botonConsulta.addEventListener('click', app.mostrar);
    document.querySelector('.parada').addEventListener('click', app.mostrarFavorito);
    
    app.cargando.classList.toggle('hide');
  },

  renderResult: function(data, numparada) {
    app.botonConsulta.classList.toggle('disabled');
    app.botonConsulta.addEventListener('click', app.mostrar);

    document.querySelector('.parada').classList.toggle('disabled');
    document.querySelector('.parada').addEventListener('click', app.mostrarFavorito);

    app.cargando.classList.toggle('hide');

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

    app.hora.textContent = "Parada " + numparada + ", a las "+fecha.getHours()+":"+
        (fecha.getMinutes()<10?("0"+fecha.getMinutes()):fecha.getMinutes());

    //Remove content of tablaResultado
    //TODO crear function
    while(app.tablaResultado.firstChild) app.tablaResultado.removeChild(app.tablaResultado.firstChild);

    app.cabeceraTabla.remove('hide');
    document.getElementById('resultado').className = "";

    document.getElementById('limpiar').removeEventListener('click', function(){});
    document.getElementById('mostrar-tabla').removeEventListener('click', function(){});

    document.getElementById('limpiar').addEventListener('click', function(){
      document.getElementById('resultado').className = "hide";
      document.getElementById("mostrar-tabla").className = '';
    });
    document.getElementById('mostrar-tabla').addEventListener('click', function(){
      document.getElementById('resultado').className = "";
      document.getElementById("mostrar-tabla").className = 'hide';
    });

    data.forEach(function(item) {
      var tr = (document.createElement('tr'));
      for(var x in item){
        var td = (document.createElement('td'));
        td.textContent = item[x];
        tr.appendChild(td);
      }

      app.tablaResultado.appendChild(tr);
    });
  },

  addBookmark: function() {
    
    var numparada = document.getElementById("parada").value;

    if (!numparada || numparada === "") {
      alertify.alert("Debes introducir un número de parada");
      return;
    }

    alertify
      .defaultValue("Descripcion de la parada")
      .okBtn("Guardar")
      .cancelBtn("Cancelar")
      .prompt("Descripcion para la parada " + numparada +", máximo 20 caracteres",
        function (val, ev) {
          ev.preventDefault();

          var item = {Order: 1, Number: numparada, Descripcion: val};

          app.todasParadas.push(item);
          localStorage.setItem('_horarios_paradas', JSON.stringify(app.todasParadas));          

          // Actualizar favoritos
          app.mostrarFavoritos();
        }
      );
  },

  deleteAdd: function(e) {
    alertify
      .okBtn("Borrar")
      .cancelBtn("Cancelar")
      .confirm("Borrar la parada " + e.target.getAttribute('data-id') + " - " + 
      e.target.getAttribute('data-desc'), function (ev) {
          ev.preventDefault();
          
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
      });

  },

  editAdd: function(e) {

    alertify
      .defaultValue(e.target.getAttribute('data-desc'))
      .okBtn("Editar")
      .cancelBtn("Cancelar")
      .prompt("Nueva descripcion para la parada " +e.target.getAttribute('data-id') +", máximo 20 caracteres",
        function (val, ev) {
          ev.preventDefault();

          var paradasExistentes = app.todasParadas;
          app.todasParadas = [];
          //recorrer el array 
          for(var x in paradasExistentes) {
            console.log(x);
            if(paradasExistentes[x].Number != e.target.getAttribute('data-id') 
                || paradasExistentes[x].Descripcion != e.target.getAttribute('data-desc')) {
              app.todasParadas.push(paradasExistentes[x]);
            } else {
              paradasExistentes[x].Descripcion = val;
              app.todasParadas.push(paradasExistentes[x]);
            }
          }

          localStorage.setItem('_horarios_paradas', JSON.stringify(app.todasParadas));
          
          app.mostrarFavoritos();
        }
      );
  },

  deleteBookmark: function() {
    alertify
      .okBtn("Borrar")
      .cancelBtn("Cancelar")
      .confirm("Borrar todas las paradas", function (ev) {
          ev.preventDefault();

          localStorage.removeItem('_horarios_paradas');
          app.todasParadas = [];
          app.mostrarFavoritos();
      });
  },

  mostrarFavoritos: function(){
    var listaFavoritos = document.getElementById('lista-favoritos');
    
    //TODO crear function
    while(listaFavoritos.firstChild) listaFavoritos.removeChild(listaFavoritos.firstChild);

    app.todasParadas.forEach(function(parada) {
      
      var item = document.createElement('span');
      item.className = "parada btn btn-default";
      item.setAttribute('data-id', parada.Number);

      var newContent = document.createTextNode(parada.Number + ": " + parada.Descripcion);
      item.appendChild(newContent);

      listaFavoritos.appendChild(item);
      
      item.addEventListener('click', app.mostrarFavorito);

      var iconoBorrar = document.createElement('i');
      iconoBorrar.className = "borrar fa fa-trash-o btn btn-default";
      iconoBorrar.setAttribute('aria-hidden', true);
      iconoBorrar.setAttribute('data-id', parada.Number);
      iconoBorrar.setAttribute('data-desc', parada.Descripcion);

      iconoBorrar.addEventListener('click', app.deleteAdd);

      listaFavoritos.appendChild(iconoBorrar);

      var iconoEditar = document.createElement('i');
      iconoEditar.className = "editar fa fa-pencil btn btn-default";
      iconoEditar.setAttribute('aria-hidden', true);
      iconoEditar.setAttribute('data-id', parada.Number);
      iconoEditar.setAttribute('data-desc', parada.Descripcion);

      iconoEditar.addEventListener('click', app.editAdd);

      listaFavoritos.appendChild(iconoEditar);

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