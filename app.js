const mongoose = require('mongoose');
const errorController = require('./controllers/error');
const User = require('./models/user');
const pdfRoutes = require('./routes/pdf');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config();


const express = require('express');

//MANEJO DE SESIONES (express-session + MongoDBsTORE + csrf + flash)
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

// const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
//   process.env.MONGO_PASSWORD
// }@rolgamesandstone.tqgnl5u.mongodb.net/bakery-app?retryWrites=true&w=majority&appName=RolgameSandstone`;

const MONGODB_URI = process.env.MONGO_URI


const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

//Determinamos el tipo de almacenamiento de archivos con MULTER. En este caso se guardarán en 'images' y el nombre del archivo será la fecha y el nombre original
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');  // Aquí se especifica el directorio donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

//Determinamos el tipo de archivo que se puede subir
const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };


//GESTOR DE VISTAS
app.set('view engine', 'ejs')
app.set('views', 'views');


//IMPORTACIÓN DE LAS RUTAS
const adminRoutes = require('./routes/admin')
const recipeRoutes = require('./routes/user')
const authRoutes = require('./routes/auth');


//Middleware para parsear el body de las peticiones
app.use(bodyParser.urlencoded({ extended:true }));


//! ISAUTHENTICATED DEBE IR ANTES DE QUE ENTRE EN JUEGO MULTER PARA EVITAR ERRORES
app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render('500', {
      pageTitle: 'Error!',
      path: '/500',
      isAuthenticated: req.session.isLoggedIn
    });
  });


//Middleware para subir archivos
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
  );

//Middleware para servir archivos estáticos (CSS, JS, IMÁGENES)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));


//PASO 1: CONFIGURACIÓN DEL MIDDLEWARE DE SESIÓN
app.use(
    session({
      secret: 'my secret',
      resave: false,
      saveUninitialized: false,
      store: store
    })
  );
  app.use(csrfProtection);
  app.use(flash());


//PASO 2: Devolver al usuario AUTENTIFICADO EN NUESTRO REQ (si no lo está, se aplica el NEXT)
app.use((req, res, next) => {
    // throw new Error('Sync Dummy');
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        next(new Error(err));
      });
  });

//PASO 3: Establecemos variables LOCALES que podrán ser accesibles desde las VISTAS
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn; //Ahora esta variable es accesible desde la vista (en el controller auth>login -> req.session.isLoogedIn se pondrá en TRUE)
    //Por las misma razón en el controller auth>logout, se va aplica destroy() sobre cualquier dato de la sesión.
    res.locals.csrfToken = req.csrfToken();
    next();
});

//RUTAS
app.use('/', recipeRoutes);
app.use('/admin', adminRoutes);
app.use(pdfRoutes);

app.use(authRoutes);

//ERROR HANDLING
app.get('/500', errorController.get500);
app.use(errorController.get404);



//Conexión a la base de datos
mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });