const Recipe = require('../models/recipe.js');
const RecetaMdb = require('../models/recipeMdb'); //TODO EL MODELO DE MONGODB, QUITAR EL JSON INTERNO?

exports.getAddRecipe = async (req, res, next) =>{
    const recipe = new Recipe();
    if (!recipe.id){
        recipe.id = await recipe.generateId(); 
    }
    res.render('add-recipe', {
        receta : recipe
    })
}

exports.postAddRecipe = (req, res, next) =>{
    const id = req.body.id;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const instrucciones = req.body.instrucciones;
    const tiempo = req.body.tiempo;
    const dificultad = req.body.dificultad;
    const image = req.body.image;

    //! ANTIGUO: GUARDADO EN JSON
    const recipe =  new Recipe(id, nombre, descripcion, ingredientes,instrucciones, tiempo, dificultad, image);
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
}

exports.getEditRecipe = (req, res, next) => {
    const recetaId = req.params.recetaId; 
    Recipe.findOne(recetaId, recetaCallback => {
        res.render('edit-recipe' , {
            receta : recetaCallback
        });
    });   
};

exports.postEditRecipe = (req, res, next) => {
    const id = req.params.recetaId;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const instrucciones = req.body.instrucciones;
    const tiempo = req.body.tiempo;
    const dificultad = req.body.dificultad;
    const image = req.body.image;

    const recipe =  new Recipe(
        id, nombre,  
        descripcion, 
        ingredientes,
        instrucciones, 
        tiempo, 
        dificultad, 
        image);
    recipe.editRecipe();
    res.redirect(`/recipes/recipe-details/${recipe.id}`); // Redirigir a la página principal después de editar
  
}