'use strict'

// Requires
var express = require('express');
var bodyParser = require('body-parser');

//Ejecutar Express
var app = express();


//Cargar archivos de rutas
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment');

//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});



//Reescribir rutas
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);


//ruta de prueba
/*app.get('/test', (req, res) => {
    //return res.status(200).send("<h1>TEST</h1>");
    
    return res.status(200).send({
        nombre: 'Darío Chiappello',
        message: 'Rutas funcionando'
    });
});
app.post('/test', (req, res) => {
    return res.status(200).send({
        nombre: 'Darío Chiappello',
        message: 'Rutas funcionando'
    });
});*/


//Exportar modulo
module.exports = app;