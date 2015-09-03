//==========
//===EH LEE LA DOCUMENTACIÓN ACA=====
//==http://expressjs.com/guide/routing.html===
//==Para más detalles de la API MIRA ACA===
//==http://expressjs.com/4x/api.html
var express = require('express');
var app = express();
var querystring = require('querystring');
var bodyParser = require('body-parser');
// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');


//App use
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//Listas
var alumnos = [];
var docentes = [];
var consultas = [];
var respuestasPendientes = [];

//Flags de tipos
var TIPO_ALUMNO='1';
var TIPO_DOCENTE='2';

//Server HTTP
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

//---------------------------------------------------------------
//---------------------------------------------------------------

//---------------------------------------------------------------
//---------------------------------------------------------------

//Home
app.get('/', function (req, res) {
  res.send('Hello World!');
});

//Listar preguntas
app.get('/preguntas', function (req, res) {
  res.send('muestro las preguntas');
  var aux ='';
  for (var i = consultas.length - 1; i >= 0; i--) {
  	var pregunta = consultas[i];
  	aux+= pregunta.pregunta + ' ' + pregunta.respuesta + '\n';
  }
  res.send('consultas:\n' + aux);
});

//Recibe preguntas de alumnos
app.post('/consultar', function (req, res) {
  var pregunta = req.body.pregunta;
  var legajo = req.body.legajo;

  var consulta = {pregunta: pregunta, legajo: legajo, respuesta: ''};
  consultas.push(consulta);
  console.log('ahora notificar...');
  for (var i = alumnos.length - 1; i >= 0; i--) {
	   var alumno = alumnos[i];
	   console.log('Enviando notificacion a alumno ['+alumno.nombre+'] en puerto ['+alumno.puerto+']');
	   Notificar(consulta.pregunta, alumno.puerto);
  };
  res.send('pregunta enviada: ' + JSON.stringify(req.body));
});

//Suscripciones de clientes (alumnos, docentes)
app.post('/suscribir', function(req, res){
	var tipo = req.body.tipo;
	console.log('tipo ' + tipo);
	var suscripto = {nombre: req.body.nombre, legajo: req.body.legajo, puerto: req.body.puerto };
	var tipoString;

  if(tipo === TIPO_ALUMNO) {
		console.log('alumno suscripto: ' + req.body.nombre + ' - ' + req.body.legajo);
		tipoString = 'alumno';
		alumnos.push(suscripto);
	} else {
		console.log('docente suscripto');
		tipoString = 'docente';
		docentes.push(suscripto);
	}
	res.send('suscripto: ' + tipoString + ' ' + suscripto.nombre + ' ' + suscripto.puerto + ' ' + suscripto.legajo);
});

//Ver suscriptores
app.get('/suscriptores', function (req, res) {
  	var aux = 'alumnos:\n';
    console.log('cantidad alumnos: ' + alumnos.length);
    console.log('cantidad docentes: ' + docentes.length);
	
  for (var i = alumnos.length - 1; i >= 0; i--) {
		var alumno = alumnos[i];
		aux+= alumno.nombre + ' ' + alumno.puerto + '\n';
	}
	aux += 'docentes:\n';
	for (var i = docentes.length - 1; i >= 0; i--) {
		var docente = docentes[i];
		aux+= docente.nombre + ' ' + docente.puerto + '\n';
	}
	res.send(aux);
});

app.post('/escribir', function(req,res) {

});


function Notificar(pregunta, puerto) {
  // Build the post string from an object
  var post_data = '?pregunta='+pregunta;

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: puerto,
      path: '/notificar',
      method: 'POST',            
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
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
  post_req.write('sassajsnajncjdknfjkdsnfjnds');
  post_req.end();

}
