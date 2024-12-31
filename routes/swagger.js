const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task API',
            version: '1.0.0',
            description: 'API documentation for Task Management System',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:8000', // Dynamically set URL from environment or fallback to localhost
            },
        ],
        security: [
            {
                BearerAuth: [], // Applies the Bearer Authentication globally
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Specifies that the authentication uses JWT tokens
                },
            },
        },
    },
    apis: ['./routes/*.js', './controller/*.js'], // Adjust the paths to match where your route/controller files are located
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
    // Serve Swagger UI at /api-docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
