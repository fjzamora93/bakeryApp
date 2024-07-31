const RecetaMdb = require('../models/recipeMdb'); 
const User = require('../models/user');
const { ObjectId } = require('mongodb');
const ITEMS_PER_PAGE = 5;


exports.getIndex = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const usuario = req.user || null;
        console.log("USUARIO", usuario);

        const totalItems = await RecetaMdb.find().countDocuments();
        const products = await RecetaMdb.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('index', {
            usuario: usuario,
            recetas: products,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


exports.getSearch = async (req, res, next) => {
    try {
        const { search, categoria } = req.query;
        console.log("Criterios de búsqueda", search, categoria);

        const page = +req.query.page || 1;
        const usuario = req.user || null;

        let filter = {};

        if (categoria && categoria !== "todas") {
            filter.categoria = categoria;
        }

        if (search) {
            filter.nombre = { $regex: search, $options: 'i' };
        }

        const totalItems = await RecetaMdb.find(filter).countDocuments();
        const items = await RecetaMdb.find(filter)
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('index', {
            categoria: categoria,
            search: search,

            usuario: usuario,
            recetas: items,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};




exports.getRecipeDetails = async (req, res, next) => {

    const recetaId = req.params.recetaId;
    const receta = await RecetaMdb.findById(recetaId);
    console.log("receta CREATOR", receta.creator);

    //! POTENCIAL ERROR EN CASO DE QUE NO HAYA CREATOR
    let creator = await User.findById(receta.creator);
    if (!creator) {
        // Si no se encuentra el creator, establecer un ID predeterminado
        receta.creator = new ObjectId("66a2745270aea4d3ed7fa2d5");
        await receta.save();
        creator = await User.findById(receta.creator);
      }

    //Verificamos si el que visita esta vista es el autor
    let isCreator = false; 
    if (req.user){
        isCreator = req.user._id.toString() === receta.creator.toString() ? true : false;
    } 

    console.log("ISCREATOR", isCreator);
    console.log("CREATOR", creator);

    try {
        console.log("CASTING", receta);
        res.render('recipe-details',{
            receta : receta,
            isCreator : isCreator,
            creator: creator
        })
    } catch (error) {   
        console.log(err);
        res.status(500).render('500', {

    });
    }
};


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


//! TEST PARA CONECTAR CON EL FRONTEND

let posts = [
    { title: 'First Post', content: 'This is the first post content' },
    { title: 'Second Post', content: 'This is the second post content' },
    { title: 'Third Post', content: 'This is the third post content' }
  ];

exports.getPosts = (req, res, next) => {
    res.json({ message: 'Posts fetched successfully con el GET del Servidor!', posts });
      };

exports.postPosts = (req, res, next) => {
    console.log('Received CSRF Token:', req.headers['x-csrf-token']); // Mostrar el token recibido en el encabezado
    console.log('Expected CSRF Token:', req.csrfToken()); // Mostrar el token esperado
    console.log('Request Body:', req.body); // Verifica si el cuerpo de la solicitud está llegando
    const { title, content } = req.body;
    const newPost = { title, content };
    posts.push(newPost);
    console.log('Posts:', posts);
    res.status(201).json({ message: 'Post added successfully!', post: newPost });
}