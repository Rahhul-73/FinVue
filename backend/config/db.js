const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance-tracker');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not exit process in development to prevent app crash if Mongo is not running
    // Instead, log details clearly so developers can start their database.
    console.warn('Backend running without MongoDB. Please ensure MongoDB is started locally.');
  }
};

module.exports = connectDB;
