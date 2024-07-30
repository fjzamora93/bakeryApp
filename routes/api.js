const csrf = require('csurf');
const express = require('express');
const router = express.Router();

// Asegúrate de que el middleware de CSRF se ejecute antes de tus rutas
const csrfProtection = csrf({ cookie: true });
router.use(csrfProtection);

router.get('/csrf-token', (req, res) => {
    console.log("CSRF TOKEN DESDE EL BACKEND", req.session.csrfToken); // Usa el token de la sesión
    res.json({ csrfToken: req.session.csrfToken }); // Usa el token de la sesión
});

module.exports = router;


