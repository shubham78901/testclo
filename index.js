const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');

// Components
const { Connection } = require('./database/db.js'); // Destructure the Connection function

const router = require('./routes/route.js');  // This imports an object containing the router

const setupSwagger = require('./routes/swagger.js');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Setup Swagger
setupSwagger(app);

// Routes
app.use(router.router);  // Correctly access the router object

// Port and DB Credentials
const PORT = process.env.PORT || 8000;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

// Database Connection
Connection(username, password);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start Server
app.listen(PORT, () => console.log(`Server is running successfully on PORT ${PORT}`));
