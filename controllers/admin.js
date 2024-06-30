
const RecetaMdb = require('../models/recipeMdb'); //TODO EL MODELO DE MONGODB, QUITAR EL JSON INTERNO?

exports.getAddRecipe = async (req, res, next) =>{
    res.render('edit-recipe', {
        editing : false,
    })
}

exports.postAddRecipe = (req, res, next) =>{
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const instrucciones = req.body.instrucciones;
    const tiempo = req.body.tiempo;
    const dificultad = req.body.dificultad;
    const image = req.body.image;

    //TODO MODELO BASADO EN MONGODB
    const recipeMg = new RecetaMdb({
        nombre : nombre, 
        descripcion : descripcion,
        ingredientes : ingredientes,
        instrucciones : instrucciones,
        tiempo : tiempo,
        dificultad : dificultad,
        image : image
    });
    recipeMg.save()
        .then(result => {
            console.log(result);
            res.redirect('/')
        }).catch(err => {
            console.log(err);
        })
}

exports.getEditRecipe = (req, res, next) => {
    const recetaId = req.params.recetaId;
    const editing = true;
    RecetaMdb.findById(recetaId)
    .then(receta => {
        res.render('edit-recipe' , {
            receta : receta,
            editing : editing
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

exports.postEditRecipe = (req, res, next) => {
    const id = req.body.idReceta.trim(); //RECUERDA TRIMEAR LA ID PARA QUE NO HAYA PROBLEMAS CON MONGODB, QUE ESPERA UN FORMATO MUY CONCRETO
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const instrucciones = req.body.instrucciones;
    const tiempo = req.body.tiempo;
    const dificultad = req.body.dificultad;
    const image = req.body.image;

    RecetaMdb.findById(id)
        .then(recipe => {
            if (!recipe) {
                // No document found with the provided id
                // Send a response with an error message
                console.log("RECETAAAAAAAAAAAA:   ", id)
                return res.status(404).send('No recipe found with the provided id');
                
            }
            recipe.nombre = nombre;
            recipe.descripcion = descripcion;
            recipe.ingredientes = ingredientes;
            recipe.instrucciones = instrucciones;
            recipe.tiempo = tiempo;
            recipe.dificultad = dificultad;
            recipe.image = image;
            return recipe.save();
        })
        .then(result => {
            console.log('actulización', result);
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        });
}