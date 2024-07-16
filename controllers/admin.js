
const RecetaMdb = require('../models/recipeMdb'); 
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

exports.getAddRecipe = async (req, res, next) =>{
    res.render('edit-recipe', {
        editing : false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddRecipe = (req, res, next) =>{
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const instrucciones = req.body.instrucciones;
    const tiempo = req.body.tiempo;
    const dificultad = req.body.dificultad;
    const categoria = req.body.categoria;

    const image = req.file;
   
    if (!image) {
        return res.status(422).render('admin/add-recipe', {
          editing: false,
          hasError: true,
          receta: {
            nombre: nombre,
            descripcion: descripcion,
            ingredientes: ingredientes,
            instrucciones: instrucciones,
            tiempo: tiempo,
            dificultad: dificultad,
            categoria: categoria,
      
          },
          errorMessage: 'Attached file is not an image.',
          validationErrors: []
        });
      }
    const errors = validationResult(req);
    //En caso de que falle la validación
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('edit-recipe', {
          editing: false,
          hasError: true,
          receta: {
            nombre: nombre,
            descripcion: descripcion,
            ingredientes: ingredientes,
            instrucciones: instrucciones,
            tiempo: tiempo,
            dificultad: dificultad,
            categoria: categoria,
            image: image.path
          },
          errorMessage: errors.array().map(error => ({ field: error.param, msg: error.msg })),
          validationErrors: errors.array()
        });
      }
    //MODELO BASADO EN MONGODB
    const imageUrl = image.path;
    const recipeMg = new RecetaMdb({
        nombre : nombre, 
        descripcion : descripcion,
        ingredientes : ingredientes,
        instrucciones : instrucciones,
        tiempo : tiempo,
        dificultad : dificultad,
        categoria : categoria,
        image : image.path
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
            editing : editing,
            hasError: false,
            errorMessage: null,
            validationErrors: []
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
    const categoria = req.body.categoria;
    const image = req.file;
   
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('edit-recipe', {
            editing: true,
            hasError: true,
            receta: {
                _id: id,
                nombre: nombre,
                descripcion: descripcion,
                ingredientes: ingredientes,
                instrucciones: instrucciones,
                tiempo: tiempo,
                dificultad: dificultad,
                categoria: categoria,
            },
            errorMessage: errors.array(), //Código duplicado...
            validationErrors: errors.array()
          });
        }
    RecetaMdb.findById(id)
        .then(recipe => {
            if (!recipe) {
                console.log("RECETAAAAAAAAAAAA:   ", id)
                return res.status(404).send('No recipe found with the provided id');
            }
            recipe.nombre = nombre;
            recipe.descripcion = descripcion;
            recipe.ingredientes = ingredientes;
            recipe.instrucciones = instrucciones;
            recipe.tiempo = tiempo;
            recipe.dificultad = dificultad;
            recipe.categoria = categoria;
            
            console.log(image.path);
            if (image) {
                if (recipe.image) {
                    fileHelper.deleteFile(recipe.image);
                }
                recipe.image = image.path;
            }
            return recipe.save().then(result => {
                console.log('actulización', result);
                res.redirect('/');
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
    });
}