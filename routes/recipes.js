const express = require('express');
const router = express.Router();
const recetasJSON = require('../data/recipes.json');

const userController = require('../controllers/user');



router.get('/', userController.getIndex);
router.get('/recipe-details/:recetaId', userController.getRecipeDetails);



module.exports = router;