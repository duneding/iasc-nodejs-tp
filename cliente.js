var express = require('express');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var TIPO_QUERY = 'application/x-www-form-urlencoded';
var TIPO_JSON = 'application/json';

//Variables Default
var _puerto = '3001';
var tipo_entidad = '1';//1:alumno 2:docente
var PUERTO_GRUPO = '3000';

//Variables para test
var nombre = 'juan';
var legajo = '11111';

//App use
var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//Argumentos process.argv
//puerto-tipo-nombre-legajo
//ej: 3000 1 juan 212121 (alumno)
//ej2: 3000 2 superprof (docente)
process.argv.forEach(function (val, index, array) {
  if (index===2)
    _puerto = val;

  if (index===3)
    tipo_entidad = val;

  if (index===4)
    nombre = val;

  if (index===5)
    legajo = val;  

});

var server = app.listen(_puerto, function(){
	var host = server.address().address;
	var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

app.post('/suscribir', function(req, res) {
  post(JSON.stringify(Entidad()), 'suscribir', TIPO_JSON);
  res.send('Suscripto!!!');
});

app.post('/consultar', function(req, res) {  
  req.body.legajo = legajo;
  req.body.alumno = nombre;  
  post(JSON.stringify(req.body), 'consultar', TIPO_JSON);
  res.send('Enviado!!!');
});

app.post('/responder', function(req, res) {  
  req.body.docente = nombre;
  post(JSON.stringify(req.body), 'responder', TIPO_JSON);
  res.send('Respondido!!!');
});

app.post('/notificar', function(req, res){
  
  var mensaje = '';  
  if(req.body.respuestas.respuesta=="")
    mensaje = 'Pregunta al grupo alumno ' + req.body.alumno + ' : ' + req.body.pregunta;
  else
    mensaje = 'Consulta resuelta!!!\nPregunta: ' + req.body.pregunta + ' (de ' + req.body.alumno + ')\n   |--->Respuesta: '
              + req.body.respuestas.respuesta + ' (de ' + req.body.respuestas.docente + ')';
  
  console.log(mensaje);
  res.send(mensaje);
})

//------------------------------------------------------------------
//FUNCIONES---------------------------------------------------------
//------------------------------------------------------------------
function Entidad(){
  if (tipo_entidad==1) 
    return Alumno();
  else
    return Docente();
}

function Alumno(){
  return { nombre: nombre,
           legajo: legajo,
           puerto: _puerto,
           tipo:tipo_entidad
          };
}

function Docente(){
  return { nombre: nombre,
           puerto: _puerto,
           tipo:tipo_entidad
          };
}

function post(data, path, tipo) {
  // Build the post string from an object
  //var post_data = JSON.stringify(post_data_);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: PUERTO_GRUPO,
      path: '/' + path,
      method: 'POST',     
      headers: {
          'Content-Type': tipo,
          'Content-Length': data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(data);
  post_req.end();

}