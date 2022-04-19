const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const passportConfig = require("./config/passport");
const routes = require("./routes/routes");

const app = express();
const PORT = process.env.PORT || 5100;

passportConfig(passport);
app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://pawppy.herokuapp.com/",
    credentials: true,
  })
);
app.use(routes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("App is listening on port:", PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
