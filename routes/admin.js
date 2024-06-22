const path = require('path');
const express = require('express');
const RecetaClass = require('../models/recipe')



const router = express.Router();

router.get('/add-recipe', (req, res, next) =>{
    res.render('add-recipe', {
    })
})



router.post('/add', (req, res, next) =>{
    const id = req.body.id;
    const nombre = req.body.nombre;
    const image = req.body.image;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    console.log(ingredientes)
    const recipe = new RecetaClass(id, nombre, image, descripcion, ingredientes);
    //recipe.addRecipe();
    res.redirect('/')
})

router.get('/edit/:recetaId', (req, res, next) => {
    const recetaId = req.params.recetaId; 
    RecetaClass.findOne(recetaId, recetaCallback => {
        res.render('edit-recipe' , {
            receta : recetaCallback
        });
    });   
});

// Ruta POST para manejar la edición de recetas
router.post('/replace', (req, res, next) => {
    const id = req.body.id;
    const nombre = req.body.nombre;
    const image = req.body.image;
    const descripcion = req.body.descripcion;
    const ingredientes = ["nada"];

    // Aquí puedes validar los datos si es necesario

    const recipe = new RecetaClass(id, nombre, image, descripcion, ingredientes);
    recipe.editRecipe();
    res.redirect('/'); // Redirigir a la página principal después de editar
  
});

module.exports = router;