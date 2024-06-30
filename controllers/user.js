const RecetaMdb = require('../models/recipeMdb'); 

exports.getIndex = (req, res, next) =>{
    const user = req.user;
    RecetaMdb.find()
        .then(recetas => {
            res.render('index', {
                recetas:recetas,
                user: user
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


exports.getBookmark = (req, res, next) => {
    const bookmarkIds = req.user.bookmark;
    RecetaMdb.find({ _id: { $in: bookmarkIds } })
        .then(recetas => {
            res.render('user/bookmark', {
                user: req.user,
                recetas: recetas
            });
        })
        .catch(err => console.log(err));
}

exports.postSaveBookmark = (req, res, next) =>{

    idReceta = req.body.idReceta; //tenemos que buscar la ID
    RecetaMdb.findById(idReceta)
        .then(receta => {
            return req.user.addBookmark(receta)
        })
        .then( result => {
            console.log(req.user, idReceta)
            res.redirect('/bookmark')
        })
}
