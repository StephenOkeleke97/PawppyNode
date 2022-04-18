const { ObjectId } = require("mongodb");
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
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  profilePic: {
    type: String
  },
  recentlyViewed: [
    {
      type: Object,
    }
  ]
});

const favoritesSchema = new Schema({
  favorites: [{
    type: Object
  }],
  user: {
    type: ObjectId,
    ref: userSchema,
    unique: true
  }
})

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
  Token: mongoose.model("Token", tokenSchema),
  Favorites: mongoose.model("Favorites", favoritesSchema)
};
