const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    favorites: [
        {
            type: Number,
        }
    ],
    adopted: [
        {
            type: Number,
        }
    ],
    forAdoption: [
        {
            type: Number,
        }
    ]
});

module.exports = {
    User: mongoose.model("User", userSchema),
}