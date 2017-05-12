document.addEventListener('DOMContentLoaded', function () {
  app.inicio();
});

var app = {

  //URL_SERVER: 'index.php?parada=',
  //URL_SERVER: 'http://transportesrober.com:9055/websae/Transportes/parada.aspx?idparada=',
  URL_SERVER: 'https://calcicolous-moonlig.000webhostapp.com/horarios/index.php?parada=',

  cancelar: document.getElementById('cancelar'),
  guardar: document.getElementById('guardar'),

  todasParadas: [],
  ordenNuevo: 0,
  ordenInicio: 0,
  tiempoAnimacion: 750,
  configradorDiv: document.getElementById('configradorDiv'),
  principalDiv: document.getElementById('principalDiv'),

  botonConsulta: document.getElementById('botonConsulta'),
  botonMenu: document.getElementById('botonMenu'),
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

    app.botonMenu.addEventListener('click', app.showMenu);

    app.configradorDiv.style.minHeight = (window.innerHeight - 46)+"px";

    //Mostrar favoritos
    if(localStorage.getItem('_horarios_paradas')) {
      app.getAllBusStopOrder();
      app.mostrarFavoritos();
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('service-worker.js')
        .then(function() {
          //console.log('Service Worker Registered');
        });
    }
  },

  getAllBusStopOrder: function(){
      app.todasParadas = JSON.parse(localStorage.getItem('_horarios_paradas'));
      function compare(a,b) {
        if (a.Order < b.Order)
          return -1;
        if (a.Order > b.Order)
          return 1;
        return 0;
      }
      app.todasParadas.sort(compare);
      app.ordenNuevo = app.todasParadas[app.todasParadas.length - 1].Order;
      app.ordenInicio = app.todasParadas[0].Order;
  },

  showMenu: function() {
    //Durante el tiempo de la animación se quita el evento del boton menú
    app.botonMenu.removeEventListener('click', app.showMenu);
    setTimeout(function(){ app.botonMenu.addEventListener('click', app.showMenu); }, app.tiempoAnimacion);

    if (app.configradorDiv.classList.contains('swipe-izquierda')) {
        app.configradorDiv.classList.add('swipe-derecha');
        app.configradorDiv.classList.remove('swipe-izquierda');
        app.botonMenu.classList.add('fa-bars');
        app.botonMenu.classList.remove('fa-arrow-right');
        app.principalDiv.classList.remove('hide');
    } else {
        app.configradorDiv.classList.remove('swipe-derecha');
        app.configradorDiv.classList.add('swipe-izquierda');
        app.botonMenu.classList.remove('fa-bars');
        app.botonMenu.classList.add('fa-arrow-right');
        app.principalDiv.classList.add('hide');
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
    app.botonConsulta.removeEventListener('click', app.mostrar);

    if(document.querySelector('.parada')) {
      document.querySelector('.parada').classList.toggle('disabled');
      document.querySelector('.parada').removeEventListener('click', app.mostrarFavorito);
    }

    app.cargando.classList.toggle('hide');

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
    app.botonConsulta.addEventListener('click', app.mostrar);

    if(document.querySelector('.parada')) {
      document.querySelector('.parada').classList.toggle('disabled');
      document.querySelector('.parada').addEventListener('click', app.mostrarFavorito);
    }

    app.cargando.classList.toggle('hide');
  },

  renderResult: function(data, numparada) {
    app.botonConsulta.classList.toggle('disabled');
    app.botonConsulta.addEventListener('click', app.mostrar);

    if(document.querySelector('.parada')) {
      document.querySelector('.parada').classList.toggle('disabled');
      document.querySelector('.parada').addEventListener('click', app.mostrarFavorito);
    }

    app.cargando.classList.toggle('hide');

    if (data.hasOwnProperty("error")){
      app.operacion.textContent = data.error;
      return false;
    }

    if (data.length < 1) {
      app.operacion.textContent = "No hay bus acercandose";
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

    for (var i in app.todasParadas) {
        if(app.todasParadas[i].Number === numparada) {
            alertify.alert("Ya tienes la parada " + numparada + " guardada con la descripción \"" + app.todasParadas[i].Descripcion +"\"");
            return;
        }
    }


    alertify
      .defaultValue("Descripcion de la parada")
      .okBtn("Guardar")
      .cancelBtn("Cancelar")
      .prompt("Descripcion para la parada " + numparada +", máximo 20 caracteres",
        function (val, ev) {
          ev.preventDefault();

          var item = {Order: app.ordenNuevo + 1, Number: numparada, Descripcion: val};

          app.todasParadas.push(item);
          localStorage.setItem('_horarios_paradas', JSON.stringify(app.todasParadas));

          // Actualizar favoritos
          app.mostrarFavoritos();
        }
      );
  },

  deleteAdd: function(e) {
    var numparada = e.target.getAttribute('data-id');
    alertify
      .okBtn("Borrar")
      .cancelBtn("Cancelar")
      .confirm("¿Borrar la parada " + e.target.getAttribute('data-id') + " - " +
      e.target.getAttribute('data-desc') + "?", function (ev) {
          ev.preventDefault();

          var paradasExistentes = app.todasParadas;
          app.todasParadas = [];
          //recorrer el array
          for(var x in paradasExistentes) {
            if(paradasExistentes[x].Number !== numparada) {
              app.todasParadas.push(paradasExistentes[x]);
            }
          }

          localStorage.setItem('_horarios_paradas', JSON.stringify(app.todasParadas));

          app.mostrarFavoritos();
      });

  },

  editAdd: function(e) {
    var numparada = e.target.getAttribute('data-id');

    alertify
      .defaultValue(e.target.getAttribute('data-desc'))
      .okBtn("Editar")
      .cancelBtn("Cancelar")
      .prompt("Nueva descripcion para la parada " +e.target.getAttribute('data-id') +", máximo 20 caracteres",
        function (val, ev) {
          ev.preventDefault();

          for (var i in app.todasParadas) {
            if(app.todasParadas[i].Number === numparada) {
              app.todasParadas[i].Descripcion = val;
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
      .confirm("¿Borrar todas las paradas?", function (ev) {
          ev.preventDefault();

          localStorage.removeItem('_horarios_paradas');
          app.todasParadas = [];
          app.ordenNuevo = 0;
          app.ordenInicio = 0;
          app.mostrarFavoritos();
      });
  },

  upBookmark: function(e){
      var source = e.target.getAttribute('data-id');
      var newOrder = 0;

      for (var i in app.todasParadas) {
        if(app.todasParadas[i].Number === source) {
            var tempOrder = app.todasParadas[i].Order;
            app.todasParadas[i].Order = newOrder;
            app.todasParadas[parseInt(i)-1].Order = tempOrder;
        }
        newOrder = app.todasParadas[i].Order;
      }
      localStorage.setItem('_horarios_paradas', JSON.stringify(app.todasParadas));
      app.mostrarFavoritos();
  },

  downBookmark: function(e){
      var source = e.target.getAttribute('data-id');
      var newOrder = 0;

      for (var i in app.todasParadas) {
        newOrder = app.todasParadas[i].Order;
        if(app.todasParadas[i].Number === source) {
            var tempOrder = app.todasParadas[parseInt(i)+1].Order;
            app.todasParadas[parseInt(i)+1].Order = newOrder;
            app.todasParadas[i].Order = tempOrder;
        }
      }
      localStorage.setItem('_horarios_paradas', JSON.stringify(app.todasParadas));
      app.mostrarFavoritos();
  },

  mostrarFavoritos: function(){
    app.getAllBusStopOrder();
    var listaFavoritos = document.getElementById('lista-favoritos');
    var listaConfigurador = document.getElementById('configradorDiv');


    //TODO crear function
    while(listaFavoritos.firstChild) listaFavoritos.removeChild(listaFavoritos.firstChild);
    while(listaConfigurador.firstChild) listaConfigurador.removeChild(listaConfigurador.firstChild);

    app.todasParadas.forEach(function(parada) {

      var item = document.createElement('span');
      item.className = "parada btn btn-default btn-lg";
      item.setAttribute('data-id', parada.Number);

      var newContent = document.createTextNode(parada.Number + ": " + parada.Descripcion);
      item.appendChild(newContent);

      listaFavoritos.appendChild(item);
      item.addEventListener('click', app.mostrarFavorito);

      var itemConf = document.createElement('span');
      itemConf.className = "parada btn btn-default btn-lg";

      var newContent = document.createTextNode(parada.Number);
      itemConf.appendChild(newContent);

      listaConfigurador.appendChild(itemConf);

      var iconoBorrar = document.createElement('i');
      iconoBorrar.className = "borrar fa fa-trash-o btn btn-default btn-lg";
      iconoBorrar.setAttribute('aria-hidden', true);
      iconoBorrar.setAttribute('data-id', parada.Number);
      iconoBorrar.setAttribute('data-desc', parada.Descripcion);

      iconoBorrar.addEventListener('click', app.deleteAdd);

      //listaFavoritos.appendChild(iconoBorrar);
      listaConfigurador.appendChild(iconoBorrar);

      var iconoEditar = document.createElement('i');
      iconoEditar.className = "editar fa fa-pencil btn btn-default btn-lg";
      iconoEditar.setAttribute('aria-hidden', true);
      iconoEditar.setAttribute('data-id', parada.Number);
      iconoEditar.setAttribute('data-desc', parada.Descripcion);

      iconoEditar.addEventListener('click', app.editAdd);

      listaConfigurador.appendChild(iconoEditar);


      var iconoSubir = document.createElement('i');
      iconoSubir.className = "subir fa fa-long-arrow-up btn btn-default btn-lg";
      iconoSubir.setAttribute('aria-hidden', true);
      iconoSubir.setAttribute('data-id', parada.Number);

      if(parada.Order !== app.ordenInicio) {
        iconoSubir.addEventListener('click', app.upBookmark);
      } else {
        iconoSubir.classList.add('disabled');
      }
      listaConfigurador.appendChild(iconoSubir);


      var iconoBajar = document.createElement('i');
      iconoBajar.className = "bajar fa fa-long-arrow-down btn btn-default btn-lg";
      iconoBajar.setAttribute('aria-hidden', true);
      iconoBajar.setAttribute('data-id', parada.Number);

      if(parada.Order !== app.ordenNuevo) {
        iconoBajar.addEventListener('click', app.downBookmark);
      } else {
        iconoBajar.classList.add('disabled');
      }
      listaConfigurador.appendChild(iconoBajar);

      var salto = document.createElement('div');
      salto.className = "salto";
      listaFavoritos.appendChild(salto);
      listaConfigurador.appendChild(salto);
    });

    if(app.todasParadas.length > 0) {

      var iconoBorrarTodo = document.createElement('i');
      iconoBorrarTodo.className = "fa fa-trash btn btn-default fa-2x";
      iconoBorrarTodo.setAttribute('aria-hidden', true);
      iconoBorrarTodo.setAttribute('id', 'borrar-todo');

      var iconoBorrarTodoTexto = document.createElement('span');
      iconoBorrarTodoTexto.textContent = ' BORRAR TODAS';
      iconoBorrarTodo.appendChild(iconoBorrarTodoTexto);

      listaConfigurador.appendChild(iconoBorrarTodo);

      iconoBorrarTodo.addEventListener('click', app.deleteBookmark);
    }

  }
};
