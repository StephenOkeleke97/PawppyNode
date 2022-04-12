const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

async function connectDB() {
  await mongoose.connect(process.env.DB_URI);
  console.log("Connected to database");
  return mongoose.connection.getClient();
}

module.exports = connectDB;
