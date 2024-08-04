//! TEST PARA CONECTAR CON EL FRONTEND

let posts = [
    { title: 'First Post', content: 'This is the first post content' },
    { title: 'Second Post', content: 'This is the second post content' },
    { title: 'Third Post', content: 'This is the third post content' }
  ];

exports.getPosts = (req, res, next) => {
    res.json({ message: 'Posts fetched successfully!', posts });
};


exports.postPosts = (req, res, next) => {
    try {
        // Verifica si el CSRF Token está presente
        const csrfToken = req.headers['x-csrf-token'];
        if (!csrfToken) {
            return res.status(400).json({ error: 'CSRF Token is missing' });
        }
        console.log('Received CSRF Token:', csrfToken);

        // Verifica si el cuerpo de la solicitud contiene 'title' y 'content'
        if (!req.body || !req.body.title || !req.body.content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        console.log('Request Body:', req.body);
        const { title, content } = req.body;

        // Valida los datos recibidos
        if (typeof title !== 'string' || typeof content !== 'string') {
            return res.status(400).json({ error: 'Title and content must be strings' });
        }

        // Crea un nuevo post y lo agrega a la lista de posts
        const newPost = { title, content };
        posts.push(newPost);
        console.log('Posts:', posts);

        // Responde con éxito
        res.status(201).json({ message: 'Post added successfully!', post: newPost });
    } catch (error) {
        // Maneja cualquier error inesperado
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}
