const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.Mongodb_URI, {});
        console.log("Connected to database successfully");
    } catch (error) {
        console.log("Error connecting to database:", error);
    }
}   

module.exports = connectDB;