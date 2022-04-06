const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const { User } = require("../schema/schema");
const { validPassword, generatePassword, issueJWT } = require("../utils/utils");

dotenv.config();

function validateEmail(email) {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

function validatePassword(password) {
  const regex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  return regex.test(password);
}

function checkEmailAndPasswordNotUndefined(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const message = "Email and password are required";
    sendResponse(res, 400, message, false);
  } else {
    next();
  }
}

function checkValidEmail(req, res, next) {
  const email = req.body.email.trim();
  if (!validateEmail(email)) {
    const message = "Invalid Email Address";
    sendResponse(res, 400, message, false);
  } else {
    next();
  }
}

function sendResponse(res, status, message, success) {
  res.status(status).send({
    message: message,
    success: success,
  });
}

function checkValidCredentials(req, res, next) {
  const email = req.body.email.trim();
  const password = req.body.password;

  const user = User.findOne({ email: email });
  user
    .then((user) => {
      const message = "Invalid Email Address or Password";
      if (user) {
        if (validPassword(password, user.salt, user.password)) next();
        else sendResponse(res, 401, message, false);
      } else {
        sendResponse(res, 401, message, false);
      }
    })
    .catch((err) => {
      const message = "Something went wrong. Please try again later";
      sendResponse(res, 500, message, false);
    });
}

function checkValidPassword(req, res, next) {
  const password = req.body.password;

  if (!validatePassword(password)) {
    const message = `Password does not meet the required standard. A password 
    must have at least 8 characters and contain at least one 
    upper case letter, one lower case letter, one number, 
    and one special character`;
    sendResponse(res, 400, message, false);
  } else {
    next();
  }
}

function CheckIfEmailUnique(req, res, next) {
  const email = req.body.email.trim();

  User.findOne({ email: email }, (err, result) => {
    if (err) console.log(err);
    else if (result)
      res.status(400).send({
        message: "There is an account associated with this email",
        success: false,
      });
    else next();
  });
}

router.post(
  "/login",
  [checkEmailAndPasswordNotUndefined, checkValidEmail, checkValidCredentials],
  (req, res) => {
    const email = req.body.email.trim();
    User.findOne({ email: email })
      .then((user) => {
        const message = "Success";
        const u = { ...user.toObject() };
        delete u.password;
        delete u.salt;

        const jwt = issueJWT(u);

        res.cookie("jwt", jwt.token, {
          maxAge: 3600000 * 24,
          httpOnly: true,
          secure: process.env.NODE_ENV !== "Development"
        });

        res.status(200).send({
          message: message,
          success: true,
          user: u,
          expiresIn: jwt.expiresIn,
        });
      })
      .catch((err) => {
        const message = "Something went wrong. Please try again later";
        sendResponse(res, 500, message, false);
      });
  }
);

router.post(
  "/register",
  [
    checkEmailAndPasswordNotUndefined,
    checkValidEmail,
    checkValidPassword,
    CheckIfEmailUnique,
  ],
  (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password;

    const saltHash = generatePassword(password);
    const user = new User({
      email: email,
      password: saltHash.hash,
      salt: saltHash.salt,
    });
    user.save((err, user) => {
      if (err) {
        const message = "Something went wrong. Please try again later";
        sendResponse(res, 500, message, false);
      } else {
        const message = "Success";
        const u = { ...user.toObject() };
        delete u.password;
        delete u.salt;

        const jwt = issueJWT();

        res.cookie("jwt", jwt.token, {
          maxAge: 3600000 * 24,
          httpOnly: true,
          secure: process.env.NODE_ENV !== "Development"
        });

        res.status(200).send({
          message: message,
          success: true,
          user: u,
          expiresIn: jwt.expiresIn,
        });
      }
    });
  }
);

router.post("/signout", (req, res) => {});

module.exports = router;
