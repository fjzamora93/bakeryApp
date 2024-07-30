const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const path = require('path');
const User = require('./models/user');
const errorController = require('./controllers/error');
const pdfRoutes = require('./routes/pdf');
const adminRoutes = require('./routes/admin');
const recipeRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@rolgamesandstone.tqgnl5u.mongodb.net/bakery_app?retryWrites=true&w=majority&appName=RolgameSandstone`;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// Configuración del motor de plantillas
app.set('view engine', 'ejs');
app.set('views', 'views'); // Asegúrate de que esta carpeta exista

// Middleware para parsear cookies
app.use(cookieParser());

// Middleware de sesión
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { 
    secure: false, // Cambia a true si usas HTTPS
    sameSite: 'None' // Permite el envío de cookies en solicitudes entre dominios
}
}));



// Middleware para parsear el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para conectar con Angular (CORS)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200'); // Permite solo el origen especificado
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Permite el uso de cookies y credenciales
    next();
  });

// Middleware para subir archivos
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');  // Directorio de almacenamiento
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

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
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware para usuario autenticado y variables locales
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

// Agregar token CSRF a las variables locales
app.use(csrf());

app.use((req, res, next) => {
    console.log('Received request:', req.method, req.path);
    next();
  });

  app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = req.csrfToken(); // Genera el token solo si no existe en la sesión
    }
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.user;
    res.locals.csrfToken = req.session.csrfToken; // Usa el token de la sesión
    console.log('CSRF Token en la Solicitud GENERAL:', req.session.csrfToken); // Usa el token de la sesión
    next();
});

// Rutas
app.use('/', recipeRoutes);
app.use('/admin', adminRoutes);
app.use(pdfRoutes);
app.use(authRoutes);

app.get('/api/csrf-token', (req, res) => {
    try {
        console.log("CSRF TOKEN DESDE api/CSRF-TOKEN", req.session.csrfToken);
        res.status(201).json({ csrfToken: req.session.csrfToken });
    } catch (error) {
        console.error('Error fetching CSRF token desde el backend:', error);
        res.status(500).json({ error: 'Error fetching CSRF token desde el backend' });
    }
  });

// Manejo de errores
app.get('/500', errorController.get500);
app.use(errorController.get404);

// Conexión a la base de datos y arranque del servidor
mongoose.connect(MONGODB_URI)
  .then(result => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });
