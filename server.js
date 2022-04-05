const express = require("express");
const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5100;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("App is listening on port:", PORT);
    });
}).catch((error) => {
    console.log(error);
})