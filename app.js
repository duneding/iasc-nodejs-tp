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
var _ = require('underscore')
var TIPO_QUERY = 'application/x-www-form-urlencoded';
var TIPO_JSON = 'application/json';

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

app.get('/preguntas', function(req, res){
  res.send(JSON.stringify(consultas));
})

//Recibe preguntas de alumnos
app.post('/consultar', function (req, res) {
  
  req.body.id = consultas.length;
  var consulta = pipeline(['id', 'pregunta', 'alumno', 'legajo', 'respuestas'], req);
  
  if (yaRespondida(consulta.id)){
    res.send('pregunta ya respondida por otro loco');  
  }else{
    procesarAccion(consulta, agregar, notificar, all);
    res.send('pregunta enviada OK');
  }
});

function yaRespondida(id){

}
//Recibe respuesta de docentes
app.post('/responder', function (req, res) {

  var respuesta = pipeline(['id', 'docente', 'respuesta'], req);
  procesarAccion(respuesta, marcar, notificar, all);
  res.send('pregunta enviada OK');
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
  	var aux = 'alumnos:\nombre';
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

//------------------------------------------------------------------
//FUNCIONES---------------------------------------------------------
//------------------------------------------------------------------
function pipeline(names, value){
  var result = {};

  names.forEach(function(name){
    result = _.extend(result, newJson(name, value));
  });
  return result;
}

function newJson(name, value){
  
  if (name=='id')
    return {id:value.body.id};

  if (name=='pregunta')
    return {pregunta:value.body.pregunta};

  if (name=='legajo')
    return {legajo:value.body.legajo};

  if (name=='respuestas')
    return {respuestas:{'docente':'', respuesta:''}};

  if (name=='respuesta')
    return {respuesta:value.body.respuesta};

  if (name=='alumno')
    return {alumno:value.body.alumno};  

  if (name=='docente')
    return {docente:value.body.docente}; 
}

function agregar(consulta){
  consultas.push(consulta);
}

function marcar(consulta){  
  var res = {};
  res.docente = consulta.docente;
  res.respuesta = consulta.respuesta;
  consultas[consulta.id].respuestas = res;      
}

function all(entidades, mensaje, target){
    
  for (var i = entidades.length - 1; i >= 0; i--) {
     var entidad = entidades[i];
     console.log('Enviando notificacion a ' + target + ' ['+entidad.nombre+'] en puerto ['+entidad.puerto+']...');    
     post(mensaje, entidad.puerto, 'notificar', TIPO_JSON);
  };
}

function notificar(objeto, cont){

  var mensaje = JSON.stringify(consultas[objeto.id]);
  
  cont(alumnos, mensaje, 'alumno');
  cont(docentes, mensaje, 'docente');
}

function procesarAccion(objeto, cont1, cont2, cont3){
  cont1(objeto);
  cont2(objeto, cont3);  
}

function post(data, puerto, path, tipo) {

  // Build the post string from an object
  //var post_data = querystring.stringify({pregunta: consulta.pregunta, alumno: alumno.nombre});
  
  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: puerto,
      path: '/' + path,
      method: 'POST',
      query: data,            
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
