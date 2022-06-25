'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    test: function(req, res){
        return res.status(200).send({
            message: "topic test"
        });
    },

    save: function(req, res){
        
        //Recoger parametros
        var params = req.body;


        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
            


        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }


        if(validate_content && validate_title && validate_lang){
            //Crear objeto a guardar
            var topic = new Topic();

            //Asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            //Guardar el topic
            topic.save((err, topicStored) => {

                if(err || !topicStored){
                    res.status(404).send({
                        message: 'El tema no se ha guardado',
                        status: 'error'
                    });
                }

                //Devolver respuesta
            
            
                return res.status(200).send({
                    status: 'success',
                    topic: topicStored
                });
            });

            
        }else{
            return res.status(200).send({
                message: "Datos invalidos"
            });
        }
        
    },

    getTopics: function(req, res){
        //Cargar libreria de paginacion en la clase (Modelo)


        //Recoger la pagina actual
        if(req.params.page == null || req.params.page == undefined || req.params.page == false || req.params.page == 0 || req.params.page == '0'){
            var page = 1;
        }else{
            var page = parseInt(req.params.page);
        }
        


        //Indicar opciones de paginacion
        var options = {
            sort: { date: -1},
            populate: 'user',
            limit: 5,
            page: page
        }

        //Find paginado
        Topic.paginate({}, options, (err, topics)=> {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la consulta'
                }); 
            }

            if(!topics){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay topics'
                }); 
            }
            //Devolver resultado(topics, total de topics, total de paginas)
        
            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });


        
    },

    getTopicsByUser: function(req, res){
        
        // Conseguir id del usuario
        var userId = req.params.user;

        // Find con la condicion de usuario
        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) =>{
            if(err){
                return res.status(500).send({
                    message: "Error en la petición"
                });
            }
            if(!topics){
                return res.status(404).send({
                    message: "No hay topics para mostrar",
                    status: 'error'
                });
            }

            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                topics
            });
        });   
    },

    getTopic: function(req, res){
        
        //Sacar id del topic de url
        var topicId = req.params.id;
        //Find por ide del topic
        Topic.findById(topicId)
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
        
    },

    update: function(req, res){
        //Recoger id del topic de la url
        var topicId = req.params.id;

        //Recoger datos del post
        var params = req.body;

        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
            


        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }

        if(validate_title && validate_content && validate_lang){
            //Montar un json con los datos mofidicados
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };

            //Find and update del topic por id y id de usuario
            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new: true}, (err, topicUpdated) =>{

                if(err){
                    return res.status(500).send({
                        message: 'Error en la petición',
                        status: 'error'
                    });
                }

                if(!topicUpdated){
                    return res.status(404).send({
                        message: 'El topic no se ha actualizado',
                        status: 'error'
                    });
                }

                //Devolver resultado
                return res.status(200).send({
                    status: 'success',
                    topic: topicUpdated
                });
            });
            
            
        }else{
            return res.status(200).send({
                message: 'La validación de los datos es incorrecta'
            });
        }

        
    },

    delete: function(req, res){
        
        // Sacar id del topic de la url
        var topicId = req.params.id;

        //find and delete por topic id y por user id
        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved)=>{
            if(err){
                return res.status(500).send({
                    message: 'Error en la petición',
                    status: 'error'
                });
            }

            if(!topicRemoved){
                return res.status(404).send({
                    message: 'El topic no se ha eliminado',
                    status: 'error'
                });
            }

            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                topic: topicRemoved
            });
        });

        
        
    },

    search: function(req, res){

        //Sacar string a buscar de ulr
        var searchString = req.params.search;

        //Find pero con operador or | $or permite que se cumpla una condicion u otra
        Topic.find({ "$or": [
            { "title": {"$regex": searchString, "$options": "i"} },
            { "content": {"$regex": searchString, "$options": "i"} },
            { "lang": {"$regex": searchString, "$options": "i"} },
            { "code": {"$regex": searchString, "$options": "i"} }
        ]})
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics) =>{
           if(err){
            return res.status(500).send({
                status: 'error',
                message: "Error en la búsqueda"
            });
           }
           
           if(!topics){
            return res.status(404).send({
                status: 'error',
                message: "No hay resultados disponibles"
            });
           }

           //Devolver resultado
            return res.status(200).send({
                status: 'success',
                topics
            });
           
        });

    }
};

module.exports = controller;