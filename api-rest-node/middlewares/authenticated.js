'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave-secreta-para-generar-el-token-9999';

exports.authenticated = function (req, res, next){

    //Comprobar si llega la autorizacion
    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'La cabecera no tiene el mensaje de autorizacion'
        });
    }

    //Limpiar el token y quitar comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');

    
    try{
        //Decodificar el token
        var payload = jwt.decode(token, secret);

        //Comprobar expiracion del token
        if(payload.exp <= moment.unix()){
            return res.status(404).send({
                message: 'Token ha expirado'
            });
        }

    }catch(ex){
        return res.status(404).send({
            message: 'Token invalido'
        });
    }

    

    //Adjuntar usuario identificado a la request
    req.user = payload;

    //Pasar a la accion

    //console.log("middleware");
    next();
}