'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');
//const user = require('../models/user');

var controller = {
    probando: function(req, res){
        return res.status(200).send({
            message: "Metodo probando"
        });
    },
    test: function(req, res){
        return res.status(200).send({
            message: "Metodo test"
        });
    },
    //guardar usuario
    save: function(req, res){
        //Recoger los parametros de la peticion
        var params = req.body;

        //Validar los datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = validator.isEmail(params.email) && !validator.isEmpty(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
               
            });
        }
        

        //console.log(validate_name, validate_surname, validate_email, validate_password);
        if(validate_name && validate_surname && validate_email && validate_password){
            // Crear objeto
            var user = new User();


            // Asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            //user.password = params.password;
            user.role = 'ROLE_USER';
            user.image = null;

            // Comprobar si el usuario existe
            User.findOne({email: user.email}, (err, issetUser) =>{
                if(err){
                    return res.status(500).send({
                        message: 'Error al comprobar existencia del usuario'
                    });
                }

                if(!issetUser){
                    //Si no existe, cifrar password y guardar usuario
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        //Guardar usuario
                        user.save((err, userStored) => {
                            if(err){
                                return res.status(500).send({
                                    message: 'Error al guardar el usuario'
                                });
                            }
                            if(!userStored){
                                return res.status(400).send({
                                    message: 'El usuario no se ha guardado'
                                });
                            }

                            //Devolver respuesta
                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            });
                        }); //close save


                        
                        /*return res.status(200).send({
                            message: 'El usuario no existe en la base de datos',
                            user
                        });*/
                    }); //close bcrypt

                    
                }else{
                    return res.status(500).send({
                        message: 'El usuario ya existe en la base de datos'
                    });
                }
            });

            
        }else{
            return res.status(200).send({
                message: 'El usuario no ha podido registrarse correctamente!'
            });
        }

        
        /*return res.status(200).send({
            message: 'Registro de usuarios',
            //email: params.email
        });*/
    },

    login: function(req, res){
        //Recoger parametros de la peticion
        var params = req.body;

        //Validar datos
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
               
            });
        }
        

        if(!validate_email || !validate_password){
            return res.status(400).send({
                message: "Datos incorrectos"
            });
        }

        //Buscar usuarios que coincidan con el email
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {
            
            if(err){
                return res.status(500).send({
                    message: "Error al intentar identificarse"
                });
            }
            
            if(!user){
                return res.status(404).send({
                    message: "El usuario no existe"
                });
            }

            //Si lo encuentra, comprobar la contraseña
            bcrypt.compare(params.password, user.password, (err, check) => {
                /*if(err){
                    return res.status(500).send({
                        message: "Error al intentar identificarse"
                    });
                }*/
                if(check){
                    
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        //generar token jwt


                        //Limpiar el objeto. Asi no se devulve la password por postman
                        user.password = undefined;

                        //Si es correcto devuelve los datos

                        return res.status(200).send({
                            status: "success",
                            user
                        });
                    }
                    
                }else{
                    return res.status(404).send({
                        message: "Las credenciales son incorrectas"
                    });
                }

                

            });      
        });

        
    },

    update: function(req, res){
        //Crear middleware para comprobar jwt token y adjuntarlo a la ruta

        //recoger los datos del usuario
        var params = req.body;

        //validar datos
        try{
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = validator.isEmail(params.email) && !validator.isEmpty(params.email);
            
            
           
        }
        catch(err){
            return res.status(200).send({
                message: "Faltan datos por enviar"
               
            });
        }

         
         //eliminar propiedades innecesarias
         delete params.password;  
            
         var userId = req.user.sub;

         //comprobar si el usuario es unico
         if(req.user.email != params.email){
            User.findOne({email: params.email.toLowerCase()}, (err, user) => {
            
                if(err){
                    return res.status(500).send({
                        message: "Error al intentar identificarse"
                    });
                }

                
                
                if(user && user.email == params.email){
                    return res.status(400).send({
                        message: "El email no puede ser modificado"
                    });
                }else{
                    User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) =>{

                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar el usuario'
                            
                            });
                        }
        
                        if(!userUpdated){
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar el usuario'
                            
                            });
                        }
                        
                        //devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userUpdated
                        
                        });
                    });
                }
            });
         }else{
            //buscar y actualizar documento
            //User.findOneAndUpdate(condicion, datos a actualizar, opciones, callback);
            User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) =>{

                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar el usuario'
                    
                    });
                }

                if(!userUpdated){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar el usuario'
                    
                    });
                }
                
                //devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                
                });
            });
         }

         
      
        
        
    },

    uploadAvatar: function(req, res){
        //Configurar el modulo multiparty (md) routes/user.js


        //Recoger el fichero de la petición
        var file_name = 'Avatar no subido...';

        //console.log(req.files);
        //if(!req.files){
        if(!req.file){
            //Devolver respuesta
            return res.status(404).send({
                status: 'error',
                message: file_name
            
            });
        }

        // Conseguir el nombre y la extensión del archivo
        //var file_path = req.files.file0.path;
        var file_path = req.file.path;
        //console.log(file_path);
        var file_split = file_path.split('\\')

        //  *****Advertencia en linux o mac file_path.split('/')

        //Nombre del archivo
        var file_name = file_split[2]; //El indice 2 es el indice donde esta el nombre de la imagen

        //Comprobar la extension del archivo (solo imagenes), si no es valida borrar el fichero subido
        //Extensión del archivo
        var ext_split = file_name.split('\.'); //corta a partir del punto
        var file_ext = ext_split[1]; //Indice que indica la extensión del archivo

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif' && file_ext != 'JPG' && file_ext != 'JPEG' && file_ext != 'GIF' && file_ext != 'PNG'){
            fs.unlink(file_path, (err) =>{
                //Devolver respuesta
                return res.status(200).send({
                    status: 'error',
                    message: "La extensión del archivo no es valida"
                });
            });
        }else{
            //Sacar el id del usuario identificado
            var userId = req.user.sub;
            //Buscar y actualizar documento de la db
            User.findOneAndUpdate({_id: userId}, {image: file_name}, {new: true}, (err, userUpdated) =>{
                if(err || !userUpdated){
                    return res.status(500).send({
                        status: 'error',
                        message: "Error al subir la imagen"
                    });
                }
                
                
                
                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                
                });
            })


            
        }

        
    },

    avatar: function(req, res){
        var fileName = req.params.fileName;

        var pathFile = './uploads/users/' + fileName;

        fs.exists(pathFile, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({
                    message: 'La imagen no existe'
                });
            }
        });
    },

    getUsers: function(req, res){
        User.find().exec((err, users) => {
            if(err || !users){
                return res.status(404).send({
                    message: 'No hay usuarios que mostrar',
                    status: 'error'
                });
            }

            return res.status(200).send({
                status:'success',
                users
            });
        });
    },

    getUser: function(req, res){
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) =>{
            if(err || !user){
                return res.status(404).send({
                    message: 'El usuario no existe',
                    status: 'error'
                });
            }

            return res.status(200).send({
                status:'success',
                user
            });
        })
    }

};

module.exports = controller;