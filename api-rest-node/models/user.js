'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
});

UserSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.password;
    // Elimina la contraseña cuando devuelve el objeto de usuario para que ese dato no llegue como respuesta al cliente


    return obj;
}

module.exports = mongoose.model('User', UserSchema);
                                //lowercase y pluralizar el nombre
                                //users -> documentos (schema)