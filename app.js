const mongoose = require('mongoose');
const User = require('./models/user');

const path = require('path');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();
const adminRoutes = require('./routes/admin')
const recipeRoutes = require('./routes/recipes')

app.set('view engine', 'ejs')
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', recipeRoutes);
app.use('/admin', adminRoutes);


app.use((req, res, next) => {
    User.findById('667ff0ba6c45b2d2da014a56')
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  });

//Conexión a la base de datos
mongoose.connect(
            'mongodb+srv://elgatobarista:megamanx5@rolgamesandstone.tqgnl5u.mongodb.net/bakery_app?retryWrites=true&w=majority&appName=RolgameSandstone'
        )
        .then(result => {
            User.findOne().then(user => {
            if (!user) {
                const user = new User({
                name: 'Gato',
                email: 'elgatobarista@test.com',
                cart: {
                    items: []
                }
                });
                user.save();
            }
            });
            app.listen(3000);
        })
        .catch(err => {
            console.log(err);
        });