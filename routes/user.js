const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');


//recuerda que user parte desde la ruta principal, no tiene una propia como la tiene admin

router.get('/', userController.getIndex);
router.get('/recipe-details/:recetaId', userController.getRecipeDetails);

//Los controllers se ejecutarán en orden. Si el primero da el NEXT (porque está autentificado el usuario), pasará al siguiente
router.get('/bookmark', isAuth, userController.getBookmark);
router.post('/add-bookmark', userController.postSaveBookmark);


module.exports = router;