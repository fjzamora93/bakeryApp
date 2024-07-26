const RecetaMdb = require('../models/recipeMdb'); 

const ITEMS_PER_PAGE = 5;


exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    usuario = req.user || null;
    console.log("USUARIO", usuario);
    
    RecetaMdb.find()
      .countDocuments()
      .then(numProducts => {
        totalItems = numProducts;
        return RecetaMdb.find()
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE);
      })
      .then(products => {
        res.render('index', {
            usuario: usuario,
            recetas: products,
            pageTitle: 'Shop',
            path: '/',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };





exports.getRecipeDetails = (req, res, next) => {
    const recetaId = req.params.recetaId; //req.params: Captura los parámetros de ruta de la URL... vamos el :recetaId de la ruta que le he metido.
    RecetaMdb.findById(recetaId)
        .then(recipe => {
            console.log("CASTING", recipe);
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
