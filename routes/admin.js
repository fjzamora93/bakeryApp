const path = require('path');
const express = require('express');
const RecetaClass = require('../models/recipe')
const RecetaMdb = require('../models/recipeMdb'); //TODO EL MODELO DE MONGODB, QUITAR EL JSON INTERNO?
const adminController = require('../controllers/admin');



const router = express.Router();

router.get('/add-recipe', adminController.getAddRecipe);
router.post('/add', adminController.postAddRecipe );
router.get('/edit/:recetaId', adminController.getEditRecipe);
router.post('/onEdit/:recetaId', adminController.postEditRecipe );



module.exports = router;