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
  animals: [{
    type: Object,
    validate: {
      validator: function(value) {
        return value.length <= 10;
      },
      message: "User cannot have more than 10 favorites"
    }
  }],
  user: {
    type: ObjectId,
    ref: "User",
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
