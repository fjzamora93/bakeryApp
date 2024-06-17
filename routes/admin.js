const path = require('path');
const express = require('express');
const Recipe = require('../models/recipe')



const router = express.Router();

router.get('/add-recipe', (req, res, next) =>{
    res.render('add-recipe', {
    })
})

router.get('/recipe-details/:recetaId', (req, res, next) => {
    const recetaId = req.params.recetaId; //req.params: Captura los parámetros de ruta de la URL... vamos el :recetaId de la ruta que le he metido.

    Recipe.findOne(recetaId, recetaCallback => {
        console.log('ENCONTRADA: ', recetaCallback);
        res.render('recipe-details' , {
            receta : recetaCallback
        });
    });   
});

router.post('/add', (req, res, next) =>{
    const nombre = req.body.nombre;
    const image = req.body.image;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const recipe = new Recipe(nombre, image, descripcion, ingredientes);
    recipe.addRecipe();
    res.redirect('/')
})



module.exports = router;