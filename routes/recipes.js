const express = require('express');
const router = express.Router();
const recetasJSON = require('../data/recipes.json');
const RecetaClass = require('../models/recipe');

router.get('/recipe-details', (req, res, next) => {
    res.render('recipe-details', {
      nombreReceta: 'texto de prueba'  
    });
});

router.get('/', (req, res, next) =>{
    RecetaClass.findAll(listaRecetas => {
        res.render('index', {
            recetas: listaRecetas
        });
    });
});


module.exports = router;