const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');


//recuerda que user parte desde la ruta principal, no tiene una propia como la tiene admin

router.get('/', userController.getIndex);
router.get('/recipe-details/:recetaId', userController.getRecipeDetails);
router.get('/bookmark', userController.getBookmark);
router.post('/add-bookmark', userController.postSaveBookmark);


module.exports = router;