const RecetaMdb = require('../models/recipeMdb'); 

exports.getIndex = (req, res, next) =>{
    RecetaMdb.find()
        .then(recetas => {
            res.render('index', {
                recetas:recetas
            })
        })
        .catch(err => console.log(err))
}


exports.getRecipeDetails = (req, res, next) => {
    const recetaId = req.params.recetaId; //req.params: Captura los parámetros de ruta de la URL... vamos el :recetaId de la ruta que le he metido.
    RecetaMdb.findById(recetaId)
        .then(recipe => {
            console.log("CASTING", recetaId);
            res.render('recipe-details',{
                receta : recipe
            })
        })
        .catch(err => console.log(err))
}



