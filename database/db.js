const mongoose = require('mongoose');

const Connection = async (username, password) => {
    const URL = `mongodb+srv://shubhgautamnv:SYhFxSvEnhBqJQQX@cluster0.8pioc.mongodb.net/`;
    try {
        await mongoose.connect(URL, { useNewUrlParser: true });
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error while connecting to the database ', error);
    }
};

// Export the connection function using CommonJS syntax
module.exports = {Connection};
