var express = require('express');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');

//Variables Default
var _puerto = '3001';
var tipo_entidad = '1';//1:alumno 2:docente
var puerto_grupo = '3000';

//Variables para test
var nombre_test = 'juan';
var legajo_test = '11111';

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
    nombre_test = val;

  if (index===5)
    legajo_test = val;  

});

var server = app.listen(_puerto, function(){
	var host = server.address().address;
	var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

function Entidad(){
  if (tipo_entidad==1) 
    return Alumno();
  else
    return Docente();
}

function Alumno(){
  return { nombre: nombre_test,
           legajo: legajo_test,
           puerto: _puerto,
           tipo:tipo_entidad
          };
}

function Docente(){
  return { nombre: nombre_test,
           puerto: _puerto,
           tipo:tipo_entidad
          };
}

function suscribir(entidad){  
  /*if (tipo_entidad==1)
      var data = {
                nombre: nombre_test,
                legajo: legajo_test,
                puerto: _puerto,
                tipo:tipo_entidad
              };
  else
      var data = {
                nombre: nombre_test,
                puerto: _puerto,
                tipo:tipo_entidad
              };*/

//console.log(data);
	PostCode(JSON.stringify(entidad), 'suscribir');
	//setTimeout(function(){ consultar(makeid()) }, puerto_grupo);
}

app.post('/suscribir', function(req, res) {
  suscribir(Entidad());
  res.send('Suscripto!!!');
});

app.post('/notificar', function(req, res){
  
  var pregunta = req.body.pregunta;
  var alumno = req.body.alumno;
	console.log('Pregunta al grupo alumno ' + alumno + ' : ' + pregunta);
})

app.post('/consultar', function(req, res) {  
  req.body.legajo = legajo_test;
  req.body.alumno = nombre_test;
  consultar(req.body);
  res.send('Enviado!!!');
});

function consultar(pregunta){

    PostCode(JSON.stringify(pregunta), 'consultar');
	/*setInterval(function(){ 
			//var query = '?pregunta=preguntar';
      
      var data = querystring.stringify({
        nombre: nombre_test,
        leagjo: legajo_test,
        puerto: _puerto,
        tipo:1
      });

			PostCode(data, 'preguntar')
		}, puerto_grupo);*/
	}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 50; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function PostCode(post_data_, path) {
  // Build the post string from an object
  var post_data = post_data_;

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: puerto_grupo,
      path: '/' + path,
      method: 'POST',     
      headers: {
          'Content-Type': 'application/json',
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
