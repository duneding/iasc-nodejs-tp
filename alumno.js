var express = require('express');
var app = express();
var _puerto = '3001';
var tipo_entidad = '1';
var puerto_grupo = '3000';
var querystring = require('querystring');
var bodyParser = require('body-parser');
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

//App use
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//Variables para test
var nombre_test = 'juan';
var legajo_test = '11111';

var server = app.listen(_puerto, function(){
	var host = server.address().address;
	var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

/*var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
socket.on('set nickname' , function (nickname) {
socket.nickname = nickname;
console.log(nickname + ' just connected!');

});

socket.on('msg' , function (msg) {
socket.msg = msg;
io.sockets.emit('response', msg);
});
});*/

//----------------------------------------------
//----------------------------------------------

//----------------------------------------------
//----------------------------------------------

function setPuerto(puerto){
	_puerto = puerto;
}

function suscribir(){
  var data = {
                nombre: nombre_test,
                legajo: legajo_test,
                puerto: _puerto,
                tipo:tipo_entidad
              };
//console.log(data);
	PostCode(JSON.stringify(data), 'suscribir');
	//setTimeout(function(){ consultar(makeid()) }, puerto_grupo);
}

app.post('/suscribir', function(req, res) {
  suscribir();
  res.send('Suscripto!!!');
});

app.post('/notificar', function(req, res){
	console.log('Notificacion del grupo: ' + req.query.texto);
})

app.post('/consultar', function(req, res) {  
  req.body.legajo = legajo_test;
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

console.log('POST DATA: ' + post_data);
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
