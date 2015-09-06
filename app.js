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

//Home
app.get('/', function (req, res) {
  res.send('Hello World!');
});

//Listar preguntas
app.get('/consultas', function (req, res) {
  var aux ='';
  console.log('cant preguntas: ' + consultas.length);
  for (var i = consultas.length - 1; i >= 0; i--) {
  	var pregunta = consultas[i];
  	aux+= pregunta.id + ' ' + pregunta.pregunta + ' ' + pregunta.respuesta + '\n';
  }
  res.send('consultas:\n' + aux);
  
});

//Recibe preguntas de alumnos
app.post('/consultar', function (req, res) {
  var pregunta = req.body.pregunta;
  var legajo = req.body.legajo;
  var pregunton = req.body.alumno;
  
  var id = consultas.length;
  var consulta = {id: id, pregunta: pregunta, legajo: legajo, respuesta: ''};
  addConsulta(consulta, notificar);
  res.send('pregunta enviada OK');// + JSON.stringify(req.body));
});

//Suscripciones de clientes (alumnos, docentes)
app.post('/suscribir', function(req, res){
	var tipo = req.body.tipo;

	var suscripto = {nombre: req.body.nombre, legajo: req.body.legajo, puerto: req.body.puerto };
	var tipoString;

  if(tipo === TIPO_ALUMNO) {
		console.log('alumno suscripto: ' + req.body.nombre + ' - ' + req.body.legajo);
		alumnos.push(suscripto);
	} else {
		console.log('docente suscripto: ' + req.body.nombre);
		docentes.push(suscripto);
	}

  var response = req.body.nombre + ' se encuentra Suscripto OK!!!';
	res.send(response);
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

//FUNCIONES
function addConsulta(consulta, post_action){

  consultas.push(consulta);  
  for (var i = alumnos.length - 1; i >= 0; i--) {
     var alumno = alumnos[i];
     console.log('Enviando notificacion a alumno ['+alumno.nombre+'] en puerto ['+alumno.puerto+']');
     post_action(consulta, alumno);
  };

}

function notificar(consulta, alumno) {

  // Build the post string from an object
  var post_data = querystring.stringify({pregunta: consulta.pregunta, alumno: alumno.nombre});
  
  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: alumno.puerto,
      path: '/notificar',
      method: 'POST',
      query: post_data,            
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
  post_req.write(post_data);
  post_req.end();

}
