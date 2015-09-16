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
var id;

var consultas = {};
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

  if (index ===6)
    id = val; 
});

var server = app.listen(_puerto, function(){
	var host = server.address().address;
	var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
  
  setTimeout(function(){
        Suscribir(), 3000);
      });
    

  if (tipo_entidad == 1) //soy alumno
    {
      setInterval(function(){
        consultar(), 3000);
      });
    }
  else //soy docente
      {
        setInterval(function(){
          responder(),3000);
        });
      }
  }
});






app.post('/responder', function(req, res) {   //anuncia que va a responder, espera un random y después responde.
  EstoyRespondiendo(req,res);
  setTimeout(function(){
        req.body.docente = nombre;
        post(JSON.stringify(req.body), 'responder', TIPO_JSON);
        res.send('Respondido!!!')
        , 5000);
  }
});

app.post('/estanRespondiendo', function(req,res){
    console.log('Estan respondiendo la pregunta ' + req.body.id); 
    //TODO: recibo ID de quien está respondiendo. Si soy yo, no asigno en true el flag estanrepsondiendo.
    if (req.body.consulta.docente != id){
        consultas[req.body.consulta.id].estanRespondiendo = true;
    }
    //consultas.splice(consultas.indexOf(req.body.consulta),1);
});


app.post('/notificar', function(req, res){
  
  var mensaje = '';  
  
  if(req.body.respuestas.respuesta=="")
    mensaje = 'Pregunta al grupo alumno ' + req.body.alumno + ' : ' + req.body.pregunta;
    consultas[req.body.consulta.id] = req.body.consulta;
    //agrego la consulta a mi listado de consultas pendientes.
  else
    {
        mensaje = 'Consulta resuelta!!!\nPregunta: ' + req.body.pregunta + ' (de ' + req.body.alumno + ')\n   |--->Respuesta: '
                + req.body.respuestas.respuesta + ' (de ' + req.body.respuestas.docente + ')';
      //consulta respondida, remuevo del listado.
      delete consultas[req.body.consulta.id];
    }
  
  console.log(mensaje);
 // res.send(mensaje);
})

//------------------------------------------------------------------
//FUNCIONES---------------------------------------------------------
//------------------------------------------------------------------
function EstoyRespondiendo(consulta){
  consulta.docente = id;
  post(JSON.stringify(consulta), 'estoyRespondiendo', TIPO_JSON);
  console.log('envie respuesta');
}


function consultar(){
  consulta.mensaje = makeid();
  consulta.alumno = nombre;
  consulta.legajo = legajo;
  post(JSON.stringify(consulta), 'consultar', TIPO_JSON);
}

function Suscribir()
{
  post(JSON.stringify(Entidad()), 'suscribir', TIPO_JSON);
}

function responder(){
    //primero elijo una consulta (al azar?) anuncion que empiezo a responder y después de un tiempo la respondo.
    var auxiliar = 0;
    var consultasAux = Object.keys(consultas);
    var consulta = null;
    for (var i = consultasAux.length - 1; i >= 0; i--) {
      if(!consultas[i].estanRespondiendo){
        consulta = consultas[i];
        break;
      }      
    };

    if(consulta == null)
      return;
    setTimeout(function(){  //OJO 
      EstoyRespondiendo(consulta);
    }, 3000);
    if(!consulta.estanRespondiendo)
      enviarRespuesta(consulta);
}

function enviarRespuesta(consulta){
    post(JSON.stringify(consulta), 'responder', TIPO_JSON);
}

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
           tipo:tipo_entidad,
           id: _id
          };

}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 50; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
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
