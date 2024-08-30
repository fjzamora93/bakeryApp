const postModel = require('../models/post');
const recipe = require('../models/recipeMdb');
const { uploadImageToImgur } = require('../util/file');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

exports.getPosts = async (req, res, next) => {
    console.log('GET request received en la API! ->', req.query);
    try{
        const posts = await postModel.find();
        res.json({ message: 'Posts fetched successfully!', posts });
    }
    catch {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

exports.getPostDetails = async (req, res, next) => {
    const id = req.params.postId;
    try{
        const post = await recipe.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post fetched successfully!', post });
    } catch {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}

exports.postPosts = async (req, res, next) => {
    try {
        // Verifica si el CSRF Token está presente
        const csrfToken = req.headers['x-csrf-token'];
        if (!csrfToken) {
            return res.status(400).json({ error: 'CSRF Token is missing' });
        }
        console.log('Received CSRF Token:', csrfToken);

        // Verifica si el cuerpo de la solicitud contiene 'title' y 'description'
        if (!req.body || !req.body.title || !req.body.description) {
            return res.status(400).json({ error: 'title y description are required' });
        }

        console.log('Request Body:', req.body);
        const { title, description, content, items, steps, category, date, status } = req.body;

        // Crea un nuevo post y lo agrega a la lista de posts
        const newPost = new postModel({ title, description, content, items, steps, category, date, status });

        if (req.file) {
            newPost.imgUrl = await uploadImageToImgur(req.file.path);
            console.log('Imagen subida:', newPost.imgUrl);
        } else {
            console.log('No se subió ninguna imagen');
        }

        newPost.save();
        res.status(201).json({ message: 'Post added successfully!', post: newPost });

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}

exports.putPost = async (req, res, next) => {
    try {
        if (!req.body || !req.body.title || !req.body.description) {
            return res.status(400).json({ error: 'title and description are required' });
        }
        let updatedData = { 
            title: req.body.title, 
            description: req.body.description,
            content: req.body.content,
            items: req.body.items,
            steps: req.body.steps,
            category: req.body.category,
            status: req.body.status,
            date: req.body.date
        };

        // Subida de imágenes al servidor
        const oldPost = await postModel.findById(req.params.postId);
        if (req.file) {
            updatedData.imgUrl = await uploadImageToImgur(req.file.path);
        }
        const updatedPost = await postModel.findByIdAndUpdate(req.params.postId, updatedData, { new: true });
        res.status(200).json({ message: 'Post updated successfully!', updatedPost });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

exports.deletePost = async (req, res, next) => {
    console.log('DELETE request received for postId en la API:', req.params.postId);
    try {
        const postId = req.params.postId;
        const deletedPost = await postModel.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json({ message: `Post ${postId} deleted successfully!` });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

//!AUTHENTITICATION
exports.postLogin =  async (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    try {
        const user = await User.findOne({ $or: [{ email: email }, { name: email }] });
        if (!user) {
            return res.status(422).json({
                success: false,
                message: 'Nombre de usuario, email o contraseñas incorrectas.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: []
            });
        }

        // Compara la contraseña
        const doMatch = await bcrypt.compare(password, user.password);
        if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            // Guarda la sesión
            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if (err) {
                        console.log('Error al guardar la sesión:', err);
                        return reject(err);
                    }
                    resolve();
                });
            });

            // Enviar respuesta JSON al frontend
            return res.status(200).json({
                success: true,
                message: 'Login successful!',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    posts: user.posts,
                    bookmark: user.bookmark
                }
            });
        } else {
            return res.status(422).json({
                success: false,
                message: 'Nombre de usuario, email o contraseñas incorrectas.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: []
            });
        }
    } catch (err) {
        console.log('Error en el proceso de login:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};


exports.postSignup = (req, res, next) => {
    console.log('Received request de SIGNUP:', req.body);
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user
        .save()
        .then(result => {
          res.status(201).json({
            message: "User created!",
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
    });
  };
  

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
