/**
 * Este archivo solo sirve de muestra sobre cómo se podría gestionar las rutas de la API.
 * En nuestro caso, hemos optado por incluir los api/posts en USER, y el getCsrfToken en APP.JS.
 * Por lo que este fichero no se encuentra actualmente en uso.
 */

const apiController = require('../controllers/api');
const csrf = require('csurf');
const express = require('express');
const router = express.Router();


//! En nuestro caso esta línea ya está en app.js, pero podría ir en API.JS
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.session.csrfToken }); 
});

//! RUTAS DE LA API, REORDENAR SEGÚN SE NECESITE
router.get('/api/posts', apiController.getPosts);
router.post('/api/posts', apiController.postPosts);


module.exports = router;



