const express = require('express');
const {
    createPost,
    updatePost,
    deletePost,
    getPost,
    getAllPosts,
} = require('../controller/post-controller.js');
const { uploadImage, getImage } = require('../controller/image-controller.js');
const {
    newComment,
    getComments,
    deleteComment,
} = require('../controller/comment-controller.js');
const {
    loginUser,
    singupUser,
    logoutUser,
} = require('../controller/user-controller.js');
const {
    authenticateToken,
    createNewToken,
} = require('../controller/jwt-controller.js');

const router = express.Router();

// Set timeout for upload route
const uploadMiddleware = (req, res, next) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    next();
};

// Auth routes
router.post('/auth/login', loginUser);
router.post('/auth/signup', singupUser);
router.post('/auth/logout', logoutUser);
router.post('/token', createNewToken);

// Post routes
router.post('/posts', authenticateToken, createPost);
router.put('/posts/:id', authenticateToken, updatePost);
router.delete('/posts/:id', authenticateToken, deletePost);
router.get('/posts/:id', authenticateToken, getPost);
router.get('/posts', authenticateToken, getAllPosts);

// File routes with timeout handling
router.post('/upload', uploadMiddleware, uploadImage);
router.get('/file/:filename', getImage);

// Comment routes
router.post('/comments', authenticateToken, newComment);
router.get('/comments/:id', authenticateToken, getComments);
router.delete('/comments/:id', authenticateToken, deleteComment);

module.exports = {router};  // Correct export
