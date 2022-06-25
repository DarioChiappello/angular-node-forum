'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    add: function(req, res){
        // Recoger id del topic de la url
        var topicId = req.params.topicId;

        //Find por id del topic
        Topic.findById(topicId).exec((err, topic) =>{
            if(err){
                return res.status(500).send({
                    message: "Error en la petición",
                    status: 'error'
                });
            }

            if(!topic){
                return res.status(404).send({
                    message: "No existe el tema",
                    status: 'error'
                });
            }
            //Comprobar objeto usuario y validar datos
            if(req.body.content){
                try {
                    
                    var validate_content = !validator.isEmpty(req.body.content);
                    
                    
        
        
                } catch (err) {
                    return res.status(200).send({
                        message: "No has comentado nada!"
                    });
                }

                if(validate_content){
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content,
                    };
                    
                    //Dentro de la propiedad comments del objeto resultante hacer un push
                    topic.comments.push(comment);
                    //Guardar el topic completo
                    topic.save((err) =>{
                        if(err){
                            return res.status(500).send({
                                message: "Error al guardar el comentario",
                                status: 'error'
                            });
                        }

                        Topic.findById(topic._id)
                        .populate('user')
                        .populate('comments.user')
                        .exec((err, topic) =>{
                            if(err){
                                //Devolver resultado
                                return res.status(500).send({
                                    status: 'success',
                                    message: "Error en la petición"
                                });
                            }

                            if(!topic){
                                //Devolver resultado
                                return res.status(500).send({
                                    status: 'success',
                                    message: "El topic no existe"
                                });
                            }
                            
                            //Devolver resultado
                            return res.status(200).send({
                                status: 'success',
                                topic
                            });
                        })
                        //Devolver una respuesta
                        /*return res.status(200).send({
                            status: 'success',
                            topic
                        });*/
                    });
                    
                    
                }else{
                    return res.status(200).send({
                        message: "No se ha validado el comentario"
                    });
                }
            }
            
        }); 
    },

    update: function(req, res){
        
        //Conseguir id del comentario por url
        var commentId = req.params.commentId;

        //Recoger datos y validar
        var params = req.body;

        try {
                    
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(200).send({
                message: "No has comentado nada!"
            });
        }

        if(validate_content){
            //Find and update de subdocumento
            Topic.findOneAndUpdate(
                {"comments._id": commentId},
                {
                    "$set":{
                        "comments.$.content": params.content
                    }
                },
                {new: true},
                (err, topicUpdated) => {
                    if(err){
                        return res.status(500).send({
                            message: "Error en la petición",
                            status: 'error'
                        });
                    }
        
                    if(!topicUpdated){
                        return res.status(404).send({
                            message: "No existe el tema",
                            status: 'error'
                        });
                    }
                    
                    //Devolver los datos
                    return res.status(200).send({
                        status: "success",
                        topic: topicUpdated
                    });
                }
            );
        
            
        }  
    },

    delete: function(req, res){
        
        // Sacar id del topic y comentario a borrar
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        // Buscar el topic
        Topic.findById(topicId, (err, topic) =>{
            if(err){
                return res.status(500).send({
                    message: "Error en la petición",
                    status: 'error'
                });
            }

            if(!topic){
                return res.status(404).send({
                    message: "No existe el tema",
                    status: 'error'
                });
            }
            
            //Seleccionar el subdocumento (comentario)
            var comment = topic.comments.id(commentId);

            //Borrar el comentario
            if(comment){
                comment.remove();
                //Guardar el topic
                topic.save((err) =>{
                    if(err){
                        return res.status(500).send({
                            message: "Error en la petición",
                            status: 'error'
                        });
                    }
                    Topic.findById(topic._id)
                        .populate('user')
                        .populate('comments.user')
                        .exec((err, topic) =>{
                            if(err){
                                //Devolver resultado
                                return res.status(500).send({
                                    status: 'success',
                                    message: "Error en la petición"
                                });
                            }

                            if(!topic){
                                //Devolver resultado
                                return res.status(500).send({
                                    status: 'success',
                                    message: "El topic no existe"
                                });
                            }
                            
                            //Devolver resultado
                            return res.status(200).send({
                                status: 'success',
                                topic
                            });
                        })
                    //Devolver resultado
                    /*return res.status(200).send({
                        status: 'success',
                        topic
                    });*/
                });
            }else{
                return res.status(404).send({
                    message: "No existe el comentario",
                    status: 'error'
                });
            }

            
        });

        
    }
};

module.exports = controller;