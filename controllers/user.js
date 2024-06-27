const Recipe = require('../models/recipe.js');
const RecetaMdb = require('../models/recipeMdb'); //TODO EL MODELO DE MONGODB, QUITAR EL JSON INTERNO?


exports.getIndex = (req, res, next) =>{
    Recipe.findAll(listaRecetasCallback => {
        res.render('index', {
            recetas: listaRecetasCallback
        });
    });
}

exports.getRecipeDetails = (req, res, next) => {
    const recetaId = req.params.recetaId; //req.params: Captura los parámetros de ruta de la URL... vamos el :recetaId de la ruta que le he metido.
    Recipe.findOne(recetaId, recetaCallback => {
        res.render('recipe-details' , {
            receta : recetaCallback
        });
    });   
}

