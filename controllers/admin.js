
const RecetaMdb = require('../models/recipeMdb'); 
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');
const { uploadImageToImgur } = require('../util/file');
const axios = require('axios');
const fs = require('fs');
const path = require('path');  // Asegúrate de importar path
const User = require('../models/user');



exports.getAddRecipe = async (req, res, next) =>{
    console.log(req.session.user)
    res.render('edit-recipe', {
        usuario: req.session.user,
        editing : false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddRecipe = async (req, res, next) => {
    const { nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, creator } = req.body;
    const image = req.file;

    const renderError = (message, validationErrors = []) => {
        res.status(422).render('edit-recipe', {
            editing: false,
            hasError: true,
            receta: { nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, creator },
            errorMessage: message,
            validationErrors
        });
    };

    if (!image) {
        return renderError('No se ha introducido una imagen');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return renderError(errors.array().map(error => ({ field: error.param, msg: error.msg })), errors.array());
    }

    try {
        const imgurLink = await uploadImageToImgur(image.path);
        


        console.log('Imagen subida a Imgur:', imgurLink);

        const recipeMg = new RecetaMdb({
            nombre, descripcion, ingredientes, instrucciones,
            tiempo, dificultad, categoria, image: imgurLink, creator
        });

        const savedRecipe = await recipeMg.save();
        console.log('Receta guardada con éxito:', savedRecipe);

        // Añadir la referencia de la receta al array de recetas del usuario
        const user = await User.findById(creator);
        user.recetas.push(savedRecipe._id);
        await user.save();
        console.log('Receta añadida al usuario:', user);

        res.redirect('/');

    } catch (error) {
        console.error('Error al cargar la imagen a Imgur:', error);
        renderError('Error al cargar la imagen a Imgur');
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
            validationErrors: [],
            usuario: req.session.user // Creator
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
    const { nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, creator, idReceta } = req.body;
    const id = idReceta.trim();
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('edit-recipe', {
            editing: true,
            hasError: true,
            receta: { _id: id, nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, creator },
            errorMessage: errors.array(),
            validationErrors: errors.array()
        });
    }

    try {
        const recipe = await RecetaMdb.findById(id);
        if (!recipe) {
            return res.status(404).send('No recipe found with the provided id');
        }

        recipe.nombre = nombre;
        recipe.descripcion = descripcion;
        recipe.ingredientes = ingredientes;
        recipe.instrucciones = instrucciones;
        recipe.tiempo = tiempo;
        recipe.dificultad = dificultad;
        recipe.categoria = categoria;
        recipe.creator = creator;

        if (image) {
            const imgurLink = await uploadImageToImgur(image.path);
            if (recipe.image) {
                fileHelper.deleteFile(recipe.image);
            }
            recipe.image = imgurLink;
        }

        const savedRecipe = await recipe.save();
        console.log('Receta guardada con éxito:', savedRecipe);
        const user = await User.findById(creator);
        user.recipes.push(savedRecipe._id);
        await user.save();
        console.log('Receta añadida al usuario:', user);

        res.redirect('/');

    } catch (err) {
        console.error('Error en postEditRecipe:', err);
        res.status(500).render('edit-recipe', {
            editing: true,
            hasError: true,
            receta: { _id: id, nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, creator },
            errorMessage: 'Error al actualizar la receta',
            validationErrors: []
        });
    }
};