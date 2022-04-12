const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  favorites: [
    {
      type: Number,
    },
  ],
  adopted: [
    {
      type: Number,
    },
  ],
});

const tokenSchema = new Schema({
  name: {
    type: String
  },
  token: {
    type: String
  },
  expires: {
    type: String
  }
});

module.exports = {
  User: mongoose.model("User", userSchema),
  Token: mongoose.model("Token", tokenSchema)
};
