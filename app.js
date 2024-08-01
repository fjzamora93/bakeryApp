const mongoose = require('mongoose');
const errorController = require('./controllers/error');
const User = require('./models/user');
const pdfRoutes = require('./routes/pdf');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const imgur = require('imgur');
const express = require('express');
require('dotenv').config();


//MANEJO DE SESIONES (express-session + MongoDBsTORE + csrf + flash)
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser'); //! Para Angular
const csrfProtection = csrf(); //! Usa { cookie: true } si estás utilizando cookies para las sesiones

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@rolgamesandstone.tqgnl5u.mongodb.net/bakery_app?retryWrites=true&w=majority&appName=RolgameSandstone`;



const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});



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


//ORDEN 1: Middleware para parsear el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//! Middleware para CORS: MODIFICAR LOS HEADERS PARA PERMITIR OTROS DOMINIOS
const allowedOrigins = [
    'https://fjzamora93.github.io',
    'http://localhost:4200'
  ];
  
  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) { // Permite solicitudes sin origen (por ejemplo, desde Postman)
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
    credentials: true // Permite cookies y encabezados de autenticación
  };
  
  app.use(cors(corsOptions));



// ISAUTHENTICATED DEBE IR ANTES DE QUE ENTRE EN JUEGO MULTER PARA EVITAR ERRORES
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



//PASO 1: CONFIGURACIÓN DEL MIDDLEWARE DE SESIÓN y COOKIES
app.use(cookieParser()); // Asegúrate de usar cookie-parser para manejar cookies
app.use(session({
      secret: 'my secret',
      resave: false,
      saveUninitialized: false,
      store: store,
    
      //!POSIBLE GENERACIÓN DE CONFLICTO CUANDO DEJEMOS DE ESTAR CONFIGURANDO EN LOCAL
      cookie: {
        maxAge: 60000 , 
        secure: false,   //! Cambia a true si estás usando HTTPS
        domain: 'localhost' 
      }
    })
  );
  app.use(csrfProtection); 
  app.use(flash());

  //! DEPURACIÓN  DEL FRONTEND
  app.use((req, res, next) => {
    console.log('Received request:', req.method, req.path);
    next();
  });


// Paso 2: Devolver al usuario autenticado en nuestro req (si no lo está, se aplica el next)
app.use(async (req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    
    try {
      const user = await User.findById(req.session.user._id);
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    } catch (err) {
      next(new Error(err));
    }
  });
  
  // Paso 3: Establecemos variables locales que podrán ser accesibles desde las vistas
  //! CONFIGURACIÓN DEL req.csrfToken() para proteger las rutas
  app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        console.log('Ahora resulta que nunca hay token')
        req.session.csrfToken = req.csrfToken();
    }
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.user; // Asegúrate de que solo se incluya la información necesaria y no sensible
    //Este es el token que le pasamos a las vistas -por eso se guarda en local.
    res.locals.csrfToken = req.session.csrfToken;
    console.log("CSRF TOKEN DESDE EL BACKEND PASO 3", res.locals.csrfToken, req.session.csrfToken);
    next();
  });

//RUTAS
app.use('/', recipeRoutes);
app.use('/admin', adminRoutes);
app.use(pdfRoutes);
app.use(authRoutes);

//! ruta para obtener el token CSRF
app.get('/api/csrf-token', (req, res) => {
    //Cada vez que llamemos a req.csrfToken() se generará un token único y más reciente, de ahí que usemos el de la sesión
    try {
        console.log("CSRF TOKEN ÚNICO DESDE api/CSRF-TOKEN", req.session.csrfToken);
        res.status(201).json({ csrfToken: req.session.csrfToken });
    } catch (error) {
        console.error('Error fetching CSRF token desde el backend:', error);
        res.status(500).json({ error: 'Error fetching CSRF token desde el backend' });
    }
  });

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