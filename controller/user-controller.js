// Importing required modules
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const Token = require('../model/token.js');
const User = require('../model/user.js');

dotenv.config();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Signup successful
 *       500:
 *         description: Error while signing up user
 */
const singupUser = async (request, response) => {
    try {
        const hashedPassword = await bcrypt.hash(request.body.password, 10);
        const user = { username: request.body.username, name: request.body.name, password: hashedPassword };

        const newUser = new User(user);
        await newUser.save();

        return response.status(200).json({ msg: 'Signup successfull' });
    } catch (error) {
        return response.status(500).json({ msg: 'Error while signing up user' });
    }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5...
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 username:
 *                   type: string
 *                   example: johndoe
 *       400:
 *         description: Username or password does not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Username does not match
 *       500:
 *         description: Error while logging in user
 */
const loginUser = async (request, response) => {
    console.log("inside login")
    let user = await User.findOne({ username: request.body.username });
    if (!user) {
        return response.status(400).json({ msg: 'Username does not match' });
    }
    console.log("user", user)
    try {
        console.log('Matching password');
        let match = await bcrypt.compare(request.body.password, user.password);
        console.log('Password match result:', match);
        if (match) {
            const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_SECRET_KEY, { expiresIn: '15m' });
            console.log('Access token generated');
            const refreshToken = jwt.sign(user.toJSON(), process.env.REFRESH_SECRET_KEY);
            console.log('Refresh token generated');

            const newToken = new Token({ token: refreshToken });
            console.log('Saving refresh token to database');
            await newToken.save();

            response.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, name: user.name, username: user.username });
        } else {
            response.status(400).json({ msg: 'Password does not match' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        response.status(500).json({ msg: 'error while login the user' });
    }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5...
 *     responses:
 *       204:
 *         description: Logout successful
 */
const logoutUser = async (request, response) => {
    const token = request.body.token;
    await Token.deleteOne({ token: token });

    response.status(204).json({ msg: 'logout successfull' });
};

// Exporting functions using CommonJS syntax
module.exports = { singupUser, loginUser, logoutUser };
