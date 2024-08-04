const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');
const apiController = require('../controllers/api');


//recuerda que user parte desde la ruta principal, no tiene una propia como la tiene admin

router.get('/', userController.getIndex);
router.get('/recipe-details/:recetaId', userController.getRecipeDetails);

//Los controllers se ejecutarán en orden. Si el primero da el NEXT (porque está autentificado el usuario), pasará al siguiente
router.get('/bookmark', isAuth, userController.getBookmark);
router.post('/add-bookmark', userController.postSaveBookmark);
router.get('/search', userController.getSearch);

//! TEST CONEXION FRONTEND

router.get('/api/posts', apiController.getPosts);
router.post('/api/posts', apiController.postPosts);

module.exports = router;