document.addEventListener('DOMContentLoaded', function () {
  app.inicio();
});

var app = {

  //URL_SERVER: 'index.php?parada=',
  //URL_SERVER: 'http://transportesrober.com:9055/websae/Transportes/parada.aspx?idparada=',
  URL_SERVER: 'https://calcicolous-moonlig.000webhostapp.com/horarios/index.php?parada=',
  //URL_SERVER: 'https://calcicolous-moonlig.000webhostapp.com/horarios/index_mock.php?parada=',
  //URL_SERVER: 'https://horario-bus.herokuapp.com/?parada=',

  cancelar: document.getElementById('cancelar'),
  guardar: document.getElementById('guardar'),

  todasParadas: [],
  timeOuts: [],
  ordenNuevo: 0,
  ordenInicio: 0,
  tiempoAnimacion: 750,
  notifictionEnable: true,
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

  infoButton: document.getElementById('infoButton'),
  importButton: document.getElementById('importButton'),
  inputFile: document.getElementById('inputFile'),
  responsibility: document.getElementById('responsibility'),
  
  notification: document.getElementById('notification'),

  inicio: function() {

    app.botonConsulta.addEventListener('click', app.mostrar);

    app.botonAdd.addEventListener('click', app.addBookmark);

    app.botonMenu.addEventListener('click', app.showMenu);

    app.infoButton.addEventListener('click', app.showInfo);

    app.importButton.addEventListener('click', app.importFile);    

    app.configradorDiv.style.minHeight = (window.innerHeight - 46)+"px";

    //Mostrar favoritos
    if(localStorage.getItem('_horarios_paradas')) {
      app.getAllBusStopOrder();
      app.mostrarFavoritos();
    }

    //Permitir notificaciones
    if(localStorage.getItem('_horarios_notificaciones')) {
      app.notifictionEnable = JSON.parse(localStorage.getItem('_horarios_notificaciones')); 
      if(!app.notifictionEnable) {      
        app.notifictionEnable = false;
        app.notification.removeAttribute('checked');
      }      
    }

    app.notification.addEventListener('change', app.updateEnableNotification);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('service-worker.js')
        .then(function() {
          //console.log('Service Worker Registered');
        });
    }
  },

  getAllBusStopOrder: function(){
    if(localStorage.getItem('_horarios_paradas')) {
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
    }
  },

  updateEnableNotification: function () {
    if (app.notification.checked) {
      app.notifictionEnable = true;
    } else {
      app.notifictionEnable = false;
    }

    localStorage.setItem('_horarios_notificaciones', JSON.stringify(app.notifictionEnable));
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

  showInfo: function() {
    if (app.responsibility.classList.contains('hidden')) {
      app.responsibility.classList.remove('hidden');
      app.infoButton.textContent = 'Ocultar Información';
    } else {
      app.responsibility.classList.add('hidden');
      app.infoButton.textContent = 'Ver Información';
    }
  },

  mostrarFavorito: function(e) {
    document.getElementById("parada").value = e.target.getAttribute('data-id');
    app.mostrar();
  },

  mostrar: function() {
    var numparada = document.getElementById("parada").value;
    if (numparada === "") {
      alertify
        .okBtn("OK")
        .alert("Debes introducir un número de parada");
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

    fetch(url)
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' + response.status);  
          app.fn_errorXHR();
          return;
        }

        // Examine the text in the response  
        response.json()
        .then(function(data) {
          app.renderResult(data, numparada);
              
          // Delete old notifications
          for (var i=0; i<app.timeOuts.length; i++) {
            clearTimeout(app.timeOuts[i]);
          }
          app.timeOuts = [];

          // Create new notifications
          if (!data.error) {
            data.forEach(function(item) {
              app.timeOuts.push(
                setTimeout(function() {
                  app.showNotification(item.linea, numparada);
                }, (item.tiempo-1) * 60 * 1000)
              );
            });
          }

        })
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
      app.fn_errorXHR();
    });
  },

  showNotification: function(line, busStop) {
    if (app.notifictionEnable && Notification) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
      Notification.requestPermission(function(result) {
        if (result === 'granted') {
          navigator.serviceWorker.ready.then(function(registration) {
            var title = "Parada " + busStop;
            var options = {
              body:  "Acercandose la linea " + line,
              badge: "img/icon-48x48.png",
              icon: "img/icon-48x48.png",
              tag:  "horarioBus"
            };
            registration.showNotification(title, options);              
          });
        }
      });
    }
  },

  fn_errorXHR: function() {
    alertify
      .okBtn("OK")
      .alert("Error al obtener los datos, compruebe su conexión");

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
      alertify
        .okBtn("OK")
        .alert("Debes introducir un número de parada");
      return;
    }

    for (var i in app.todasParadas) {
        if(app.todasParadas[i].Number === numparada) {
            alertify
              .okBtn("OK")
              .alert("Ya tienes la parada " + numparada + " guardada con la descripción \"" + app.todasParadas[i].Descripcion +"\"");
            return;
        }
    }

    alertify
    //  .defaultValue("Descripcion de la parada")
      .okBtn("Guardar")
      .cancelBtn("Cancelar")
      .placeholder('Descripcion de la parada')
      .prompt("Descripcion para la parada " + numparada +", máximo 20 caracteres",
        function (val, ev) {

          ev.preventDefault();
          
          if (val === "") {
            alertify
              .okBtn("OK")
              .alert("Debes introducir una descripción de la parada");      
            return;
          }

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

  importFile: function(e) {
    alertify
      .okBtn("Importar")
      .cancelBtn("Cancelar")
      .confirm("¿Importar paradas?", function (ev) {
          ev.preventDefault();

          app.inputFile.click();
          app.inputFile.addEventListener('change',function(e) {
            var input = e.target;
            var reader = new FileReader();
            reader.onload = function(){
              var text = reader.result;
              localStorage.setItem('_horarios_paradas', app.csvJSON(reader.result));
              app.mostrarFavoritos();
            };
            reader.readAsText(input.files[0]);
            app.inputFile.removeEventListener('change', function(){});
            app.inputFile.value = "";
          });
      });
  },

  csvJSON: function(csv){
    var lines=csv.split("\r\n");

    var result = [];

    var headersCSV = ["Order","Number","Descripcion"]; // TODO comprobar el tipo de dato que viene en cada campo

    for(var i=0;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split(",");

      if (currentline.length > 1) {
        for(var j=0;j<headersCSV.length;j++){
          obj[headersCSV[j]] = currentline[j];
        }

        result.push(obj);
      }

    }
    
    return JSON.stringify(result);
  },

  DownloadJSON2CSV: function(objArray) {
      var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

      var str = '';

      for (var i = 0; i < array.length; i++) {
        var line = '';

        for (var index in array[i]) {
          line += array[i][index] + ',';
        }

        line.slice(0, line.Length - 1);

        str += line + '\r\n';
      }
      return str;
    },

  exportBookmark: function() {   
    var text = app.DownloadJSON2CSV(localStorage.getItem('_horarios_paradas')); 
    var jsonArray = app.csvJSON(text);
    var m = new Date();
    var dateString = m.getUTCFullYear() +"-"+ (m.getUTCMonth()+1) +"-"+ m.getUTCDate(); 
    var filename = "horarios_paradas_" + dateString + ".csv";

    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
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

  mostrarFavoritos: function() {
    app.getAllBusStopOrder();
    var listaFavoritos = document.getElementById('lista-favoritos');
    var listaConfigurador = document.querySelector('#configradorDiv #list');


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

      var iconoExportarCSV = document.createElement('i');
      iconoExportarCSV.className = "fa fa-download btn btn-default fa-2x";
      iconoExportarCSV.setAttribute('aria-hidden', true);
      iconoExportarCSV.setAttribute('id', 'export');

      var iconoExportarCSVTexto = document.createElement('span');
      iconoExportarCSVTexto.textContent = ' Exportar';
      iconoExportarCSV.appendChild(iconoExportarCSVTexto);

      listaConfigurador.appendChild(iconoExportarCSV);      

      iconoExportarCSV.addEventListener('click', app.exportBookmark);
      
    }
  
  }
};
