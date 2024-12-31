const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Token = require('../model/token.js');

dotenv.config();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/verify-token:
 *   post:
 *     summary: Authenticate and verify the JWT token
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []  # Requires Bearer token for authentication
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Token is missing
 *       403:
 *         description: Invalid token
 */
 const authenticateToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        return response.status(401).json({ msg: 'token is missing' });
    }

    jwt.verify(token, process.env.ACCESS_SECRET_KEY, (error, user) => {
        if (error) {
            return response.status(403).json({ msg: 'invalid token' });
        }

        request.user = user;
        next();
    });
}

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Create a new access token using the refresh token
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
 *                 description: The refresh token to obtain a new access token
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token
 *       401:
 *         description: Refresh token is missing
 *       404:
 *         description: Refresh token is not valid
 *       500:
 *         description: Error verifying the refresh token
 */
 const createNewToken = async (request, response) => {
    const refreshToken = request.body.token.split(' ')[1];

    if (!refreshToken) {
        return response.status(401).json({ msg: 'Refresh token is missing' });
    }

    const token = await Token.findOne({ token: refreshToken });

    if (!token) {
        return response.status(404).json({ msg: 'Refresh token is not valid' });
    }

    jwt.verify(token.token, process.env.REFRESH_SECRET_KEY, (error, user) => {
        if (error) {
            return response.status(500).json({ msg: 'invalid refresh token' });
        }
        const accessToken = jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: '15m' });

        return response.status(200).json({ accessToken: accessToken });
    });
}

module.exports = { createNewToken, authenticateToken };