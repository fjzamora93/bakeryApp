const path = require('path');
const express = require('express');
const RecetaClass = require('../models/recipe')
const RecetaMdb = require('../models/recipeMdb'); //TODO EL MODELO DE MONGODB, QUITAR EL JSON INTERNO?



const router = express.Router();

router.get('/add-recipe', async (req, res, next) =>{
    const recipe = new RecetaClass();
    if (!recipe.id){
        recipe.id = await recipe.generateId(); 
    }
    res.render('add-recipe', {
        receta : recipe
    })
})



router.post('/add', (req, res, next) =>{
    const id = req.body.id;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const instrucciones = req.body.instrucciones;
    const tiempo = req.body.tiempo;
    const dificultad = req.body.dificultad;
    const image = req.body.image;

    //! ANTIGUO: GUARDADO EN JSON
    const recipe =  new RecetaClass(id, nombre, descripcion, ingredientes,instrucciones, tiempo, dificultad, image);
    recipe.addRecipe();

    //TODO MODELO BASADO EN MONGODB
    const recipeMg = new RecetaMdb(nombre, descripcion);
    recipeMg.save()
        .then(result => {
            console.log('Created Product');
            res.redirect('/')
        }).catch(err => {
            console.log(err);
        })

    

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
    const id = null;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const instrucciones = req.body.instrucciones;
    const tiempo = req.body.tiempo;
    const dificultad = req.body.dificultad;
    const image = req.body.image;

    const recipe =  new RecetaClass(
        id, nombre,  
        descripcion, 
        ingredientes,
        instrucciones, 
        tiempo, 
        dificultad, 
        image);
    recipe.editRecipe();
    res.redirect(`/recipes/recipe-details/${recipe.id}`); // Redirigir a la página principal después de editar
  
});

module.exports = router;