const express = require('express');
const router = express.Router();
const recetasJSON = require('../data/recipes.json')

router.get('/recipe-details', (req, res, next) => {
    res.render('recipe-details', {
      nombreReceta: 'texto de prueba'  
    });
});

router.get('/', (req, res, next) =>{
    res.render('index', {
        recetas: recetasJSON
    });
});




module.exports = router;