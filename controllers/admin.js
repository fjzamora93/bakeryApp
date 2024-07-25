
const RecetaMdb = require('../models/recipeMdb'); 
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');
const axios = require('axios');
const fs = require('fs');
const path = require('path');  // Asegúrate de importar path



exports.getAddRecipe = async (req, res, next) =>{
    res.render('edit-recipe', {
        editing : false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddRecipe = async (req, res, next) => {
    const { nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria } = req.body;
    const image = req.file;

    if (!image) {
        return res.status(422).render('edit-recipe', {
            editing: false,
            hasError: true,
            receta: {
                nombre,
                descripcion,
                ingredientes,
                instrucciones,
                tiempo,
                dificultad,
                categoria,
            },
            errorMessage: 'No se ha introducido una imagen',
            validationErrors: []
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('edit-recipe', {
            editing: false,
            hasError: true,
            receta: {
                nombre,
                descripcion,
                ingredientes,
                instrucciones,
                tiempo,
                dificultad,
                categoria,
                image: image.path
            },
            errorMessage: errors.array().map(error => ({ field: error.param, msg: error.msg })),
            validationErrors: errors.array()
        });
    }

    const imagePath = path.join(__dirname, '..', image.path);
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');

    try {
        const response = await axios.post('https://api.imgur.com/3/image', {
            image: base64Image,
            type: 'base64'
        }, {
            headers: {
                Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
            }
        });

        const imgurLink = response.data.data.link;
        console.log('Imagen subida a Imgur:', imgurLink);
        
        const recipeMg = new RecetaMdb({
            nombre,
            descripcion,
            ingredientes,
            instrucciones,
            tiempo,
            dificultad,
            categoria,
            image: imgurLink  // Aquí nos aseguramos de que la URL de Imgur se guarda en la base de datos
        });

        fs.unlinkSync(imagePath); // Elimina la imagen temporal

        await recipeMg.save();
        console.log('Receta guardada con éxito:', recipeMg);
        res.redirect('/');
    } catch (error) {
        console.error('Error al cargar la imagen a Imgur:', error);
        res.status(500).render('edit-recipe', {
            editing: false,
            hasError: true,
            receta: {
                nombre,
                descripcion,
                ingredientes,
                instrucciones,
                tiempo,
                dificultad,
                categoria,
                image: image.path
            },
            errorMessage: 'Error al cargar la imagen a Imgur',
            validationErrors: []
        });
    }
};

exports.getEditRecipe = (req, res, next) => {
    const recetaId = req.params.recetaId;
    const editing = true;
    RecetaMdb.findById(recetaId)
    .then(receta => {
        res.render('edit-recipe' , {
            receta : receta,
            editing : editing,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
        }
    )
    .catch(err => console.log(err))
};

exports.postDeleteRecipe = (req,res,next) => {
    const recetaId = req.params.recetaId;
    RecetaMdb.findByIdAndDelete(recetaId)
        .then( result => {
            console.log(result)
            res.redirect('/')
        })
        .catch(err => console.log(err))
}

exports.postEditRecipe = async (req, res, next) => {
    const id = req.body.idReceta.trim();
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const instrucciones = req.body.instrucciones;
    const tiempo = req.body.tiempo;
    const dificultad = req.body.dificultad;
    const categoria = req.body.categoria;
    const image = req.file;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('edit-recipe', {
            editing: true,
            hasError: true,
            receta: {
                _id: id,
                nombre: nombre,
                descripcion: descripcion,
                ingredientes: ingredientes,
                instrucciones: instrucciones,
                tiempo: tiempo,
                dificultad: dificultad,
                categoria: categoria,
            },
            errorMessage: errors.array(),
            validationErrors: errors.array()
        });
    }

    try {
        const recipe = await RecetaMdb.findById(id);
        if (!recipe) {
            console.log("RECETAAAAAAAAAAAA:   ", id);
            return res.status(404).send('No recipe found with the provided id');
        }

        recipe.nombre = nombre;
        recipe.descripcion = descripcion;
        recipe.ingredientes = ingredientes;
        recipe.instrucciones = instrucciones;
        recipe.tiempo = tiempo;
        recipe.dificultad = dificultad;
        recipe.categoria = categoria;

        if (image) {
            const imagePath = path.join(__dirname, '..', image.path);
            const imageData = fs.readFileSync(imagePath);
            const base64Image = Buffer.from(imageData).toString('base64');

            try {
                const response = await axios.post('https://api.imgur.com/3/image', {
                    image: base64Image,
                    type: 'base64'
                }, {
                    headers: {
                        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
                    }
                });

                const imgurLink = response.data.data.link;
                console.log('Imagen subida a Imgur:', imgurLink);

                // Elimina la imagen antigua si existe
                if (recipe.image) {
                    fileHelper.deleteFile(recipe.image);
                }

                recipe.image = imgurLink;
                fs.unlinkSync(imagePath); // Elimina la imagen temporal
            } catch (error) {
                console.error('Error al cargar la imagen a Imgur:', error);
                return res.status(500).render('edit-recipe', {
                    editing: true,
                    hasError: true,
                    receta: {
                        _id: id,
                        nombre: nombre,
                        descripcion: descripcion,
                        ingredientes: ingredientes,
                        instrucciones: instrucciones,
                        tiempo: tiempo,
                        dificultad: dificultad,
                        categoria: categoria,
                    },
                    errorMessage: 'Error al cargar la imagen a Imgur',
                    validationErrors: []
                });
            }
        }

        await recipe.save();
        console.log('Actualización exitosa:', recipe);
        res.redirect('/');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};