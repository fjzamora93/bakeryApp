const express = require('express');
const router = express.Router();
const recetasJSON = require('../data/recipes.json');
const RecetaClass = require('../models/recipe');


router.get('/', (req, res, next) =>{
    RecetaClass.findAll(listaRecetasCallback => {
        console.log(listaRecetasCallback)
        res.render('index', {
            recetas: listaRecetasCallback
        });
    });
});

//TODO: Redireccionando sin más, remplazar por otra cosa???
router.get('/recipe-details', (req, res, next) => {
    res.redirect('/')
});

router.get('/recipe-details/:recetaId', (req, res, next) => {
    const recetaId = req.params.recetaId; //req.params: Captura los parámetros de ruta de la URL... vamos el :recetaId de la ruta que le he metido.
    RecetaClass.findOne(recetaId, recetaCallback => {
        console.log('ENCONTRADA: ', recetaCallback);
        res.render('recipe-details' , {
            receta : recetaCallback
        });
    });   
});



module.exports = router;