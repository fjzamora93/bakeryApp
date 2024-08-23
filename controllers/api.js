const postModel = require('../models/post');
const recipe = require('../models/recipeMdb');
const { uploadImageToImgur } = require('../util/file');
const fileHelper = require('../util/file');


exports.getPosts = async (req, res, next) => {
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
        const { title, description } = req.body;


        // Crea un nuevo post y lo agrega a la lista de posts
        const newPost = new postModel({ title, description });
        newPost.save();
        res.status(201).json({ message: 'Post added successfully!', post: newPost });

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}


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




exports.putPost = async (req, res, next) => {
    console.log('ACTUALIZANDO EN EL BACKEND:', req.params.postId);
    
    try {
        if (!req.body || !req.body.title || !req.body.description) {
            return res.status(400).json({ error: 'title and description are required' });
        }
        
        console.log("Request Body PRIMERO PASO:", req.body);
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

        //! Subida de imágenes al servidor
        const oldPost = await postModel.findById(req.params.postId);
        if (req.file) {
            const imgurLink = await uploadImageToImgur(req.file.path);
            console.log('Este es el antiguo post recuperado con req.params.postid:', oldPost.imgUrl, imgurLink);
            updatedData.imgUrl = imgurLink;
        }

        const updatedPost = await postModel.findByIdAndUpdate(req.params.postId, updatedData, { new: true });
        console.log('Updated SEGUNDO PASO Post:', updatedPost);
        res.status(200).json({ message: 'Post updated successfully!', updatedPost });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};


