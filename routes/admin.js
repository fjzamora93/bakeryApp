const path = require('path');
const express = require('express');
const RecetaClass = require('../models/recipe')
const RecetaMdb = require('../models/recipeMdb'); //TODO EL MODELO DE MONGODB, QUITAR EL JSON INTERNO?
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');


const router = express.Router();

router.get('/add-recipe', isAuth, adminController.getAddRecipe);
router.get('/edit-recipe/:recetaId', adminController.getEditRecipe);

router.post('/add', 
    [
        body('nombre')
            .isString()
            .isLength({min: 5})
            .trim(),
        body('descripcion').trim(),
    ], 
    isAuth,
    adminController.postAddRecipe );

router.post('/edit/',
    [
        body('nombre')
            .isString()
            .isLength({min: 5})
            .trim(),
        body('descripcion').trim(),
    ], 
    isAuth,
    adminController.postEditRecipe );
    
router.post('/delete/:recetaId', adminController.postDeleteRecipe);


module.exports = router;