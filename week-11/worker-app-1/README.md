import { Router } from 'itty-router';
import jwt from 'jsonwebtoken';

const router = Router();
const secret = 'your_secret_key'; // Use an environment variable in production

// User Management
const users = new Map(); // Replace with KV or Durable Objects in production
const posts = new Map(); // Replace with KV or Durable Objects in production

// Helper functions
function generateToken(user) {
    return jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (e) {
        return null;
    }
}

// Middleware to protect routes
async function authenticate(request) {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return null;
    return verifyToken(token);
}

// User Signup
router.post('/users/signup', async (request) => {
    const { username, email, password } = await request.json();

    if (users.has(email)) {
        return new Response('Email already in use.', { status: 400 });
    }
    
    // Store hashed password in a real app
    const userId = Date.now(); // Simple unique ID generation
    users.set(email, { id: userId, username, email, password });
    
    return new Response('User created successfully.', { status: 201 });
});

// User Signin
router.post('/users/signin', async (request) => {
    const { email, password } = await request.json();
    const user = users.get(email);

    if (!user || user.password !== password) {
        return new Response('Invalid credentials.', { status: 401 });
    }

    const token = generateToken(user);
    return new Response(JSON.stringify({ token }), { status: 200 });
});

// Get All Posts
router.get('/posts', async (request) => {
    const authUser = await authenticate(request);
    const userPosts = [...posts.values()].filter(post => !post.userId || post.userId === authUser?.id);
    return new Response(JSON.stringify(userPosts), { status: 200 });
});

// Create Post
router.post('/posts', async (request) => {
    const authUser = await authenticate(request);
    if (!authUser) return new Response('Unauthorized.', { status: 401 });

    const { title, body } = await request.json();
    const postId = Date.now();
    posts.set(postId, { id: postId, title, body, userId: authUser.id });

    return new Response('Post created successfully.', { status: 201 });
});

// Get Single Post
router.get('/posts/:id', async (request) => {
    const postId = request.params.id;
    const post = posts.get(postId);

    if (!post) return new Response('Post not found.', { status: 404 });
    return new Response(JSON.stringify(post), { status: 200 });
});

// Update Post
router.put('/posts/:id', async (request) => {
    const authUser = await authenticate(request);
    if (!authUser) return new Response('Unauthorized.', { status: 401 });

    const postId = request.params.id;
    const post = posts.get(postId);

    if (!post || post.userId !== authUser.id) {
        return new Response('Post not found or unauthorized.', { status: 403 });
    }

    const { title, body } = await request.json();
    posts.set(postId, { ...post, title, body });
    return new Response('Post updated successfully.', { status: 200 });
});

// Delete Post
router.delete('/posts/:id', async (request) => {
    const authUser = await authenticate(request);
    if (!authUser) return new Response('Unauthorized.', { status: 401 });

    const postId = request.params.id;
    const post = posts.get(postId);

    if (!post || post.userId !== authUser.id) {
        return new Response('Post not found or unauthorized.', { status: 403 });
    }

    posts.delete(postId);
    return new Response('Post deleted successfully.', { status: 200 });
});

// Default Route
router.all('*', () => new Response('Not Found', { status: 404 }));

addEventListener('fetch', event => {
    event.respondWith(router.handle(event.request));
});
