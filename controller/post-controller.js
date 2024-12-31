const mongoose = require('mongoose');
const Post = require('../model/post.js');


/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - subHeading
 *         - description
 *         - username
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         subHeading:
 *           type: string
 *           description: The subheading of the post
 *         description:
 *           type: string
 *           description: The detailed description of the post
 *         username:
 *           type: string
 *           description: The username of the author
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Categories of the post
 *         picture:
 *           type: string
 *           description: URL to the post's image (optional)
 *       example:
 *         title: My First Post
 *         subHeading: Introduction to programming
 *         description: This is the content of the first post.
 *         username: johndoe
 *         categories: ["Technology", "Programming"]
 *         picture: "http://example.com/post-image.jpg"
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []  # Requires Bearer token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post saved successfully
 *       400:
 *         description: Bad Request - Required fields are missing
 *       500:
 *         description: Server error
 */
 const createPost = async (request, response) => {
    const { title, subHeading, description, username, categories, picture } = request.body;

    // Ensure that required fields are provided
    if (!title || !subHeading || !description || !username) {
        return response.status(400).json({ msg: "Title, subHeading, description, and username are required" });
    }

    try {
        const post = new Post({
            title,
            subHeading,
            description,
            username,
            categories,
            picture,
            createdDate: new Date()
        });

        await post.save();

        response.status(200).json({ message: 'Post saved successfully', post });
    } catch (error) {
        console.error(error);
        response.status(500).json({ msg: 'Server error', error });
    }
};


/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []  # Requires Bearer token for authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
 const updatePost = async (request, response) => {
    const { id } = request.params;
    try {
        // Use findById to get the post by ID
        const post = await Post.findById(id);

        // Check if post exists
        if (!post) {
            return response.status(404).json({ msg: 'Post not found' });
        }

        // Update the post using findByIdAndUpdate
        await Post.findByIdAndUpdate(id, { $set: request.body }, { new: true });

        response.status(200).json('Post updated successfully');
    } catch (error) {
        console.error('Error updating post:', error);
        response.status(500).json({ msg: 'Server error' });
    }
};


/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []  # Requires Bearer token for authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       500:
 *         description: Server error
 */
 const deletePost = async (request, response) => {
    const { id } = request.params;
    console.log('delete post');
    try {
        // Find and delete the post by ID using findByIdAndDelete
        const post = await Post.findByIdAndDelete(id);
        
        // Check if the post exists before deleting
        if (!post) {
            return response.status(404).json({ msg: 'Post not found' });
        }

        response.status(200).json('Post deleted successfully');
    } catch (error) {
        console.error('Error deleting post:', error);
        response.status(500).json({ msg: 'Server error' });
    }
};


/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []  # Requires Bearer token for authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
 const getPost = async (req, res) => {
    const { id } = req.params;

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "Invalid post ID format" });
    }

    console.log("GET POST");

    try {
        // Retrieve the post by ID using findById
        const post = await Post.find({id: id});

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Return the post
        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ msg: "Server error" });
    }
};


/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts or filter by username or category
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []  # Requires Bearer token for authentication
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: The username to filter posts by
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: The category to filter posts by
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
 const getAllPosts = async (request, response) => {
    let username = request.query.username;
    let category = request.query.category;
    let posts;
    try {
        if (username)
            posts = await Post.find({ username: username });
        else if (category)
            posts = await Post.find({ categories: category });
        else
            posts = await Post.find({});

        response.status(200).json(posts);
    } catch (error) {
        response.status(500).json(error);
    }
};
module.exports = { getAllPosts, getPost, deletePost,createPost ,updatePost};