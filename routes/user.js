const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const { User, Favorites } = require("../schema/schema");
const { validPassword, generatePassword, issueJWT } = require("../utils/utils");
const passport = require("passport");

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

function validatePhoneNumber(number) {
  return number.toString().length >= 8;
}

function requiredParamsPresent(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phoneNumber = req.body.phoneNumber;

  if (!email || !password || !firstName || !lastName || !phoneNumber) {
    const message =
      "The following parameters are required: Email, password, " +
      "first name, last name and phonenumber";
    sendResponse(res, 400, message, false);
  } else {
    next();
  }
}

function emailAndPasswordPresent(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const message = "Email and password are required.";
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

function checkValidPhonenumber(req, res, next) {
  const phoneNumber = req.body.phoneNumber;

  if (!validatePhoneNumber(phoneNumber)) {
    const message = "Phone number must be at least 8 digits long.";
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
        message: "There is already an account associated with this email",
        success: false,
      });
    else next();
  });
}

function validateChangePasswordParams(req, res, next) {
  const user = req.user;
  const newPassword = req.body.newPassword;
  const password = req.body.password;
  if (!password || !newPassword) {
    const message = "password and new password are required";
    sendResponse(res, 400, message, false);
    return;
  }

  if (!validPassword(password, user.salt, user.password)) {
    const message = "Invalid Password";
    sendResponse(res, 401, message, false);
    return;
  }

  if (!validatePassword(newPassword)) {
    const message = `Password does not meet the required standard. A password 
    must have at least 8 characters and contain at least one 
    upper case letter, one lower case letter, one number, 
    and one special character`;
    sendResponse(res, 400, message, false);
    return;
  }

  next();
}

async function getUserFavorites(id, res) {
  try {
    const result = await Favorites.findOne({ user: id });
    return result ? result.animals : [];
  } catch (error) {
    const message = "Something went wrong. Please try again later.";
    sendResponse(res, 500, message, false);
  }
}

router.post(
  "/login",
  [emailAndPasswordPresent, checkValidEmail, checkValidCredentials],
  (req, res) => {
    const email = req.body.email.trim();
    User.findOne({ email: email })
      .then((user) => {
        const message = "Success";
        let u = { ...user.toObject() };
        delete u.password;
        delete u.salt;

        getUserFavorites(u._id, res).then((fav) => {
          const jwt = issueJWT(u);
          const favMap = fav.map((animal) => animal.id);
          u = { ...u, favorites: favMap };

          res.cookie("auth", "auth", {
            maxAge: 3600000 * 24,
            httpOnly: false,
            secure: process.env.NODE_ENV !== "Development",
          });

          res.cookie("jwt", jwt.token, {
            maxAge: 3600000 * 24,
            httpOnly: true,
            secure: process.env.NODE_ENV !== "Development",
          });

          res.status(200).send({
            message: message,
            success: true,
            user: u,
            expiresIn: jwt.expiresIn,
          });
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
    requiredParamsPresent,
    checkValidEmail,
    checkValidPassword,
    checkValidPhonenumber,
    CheckIfEmailUnique,
  ],
  (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password;
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const phoneNumber = req.body.phoneNumber.trim();

    const saltHash = generatePassword(password);
    const user = new User({
      email: email,
      password: saltHash.hash,
      salt: saltHash.salt,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
    });
    user.save((err, user) => {
      if (err) {
        const message = "Something went wrong. Please try again later";
        sendResponse(res, 500, message, false);
      } else {
        const message = "Success";
        let u = { ...user.toObject() };
        delete u.password;
        delete u.salt;

        getUserFavorites(u._id, res)
          .then((fav) => {
            const jwt = issueJWT(u);
            const favMap = fav.map((animal) => animal.id);
            u = { ...u, favorites: favMap };

            res.cookie("auth", "auth", {
              maxAge: 3600000 * 24,
              httpOnly: false,
              secure: process.env.NODE_ENV !== "Development",
            });

            res.cookie("jwt", jwt.token, {
              maxAge: 3600000 * 24,
              httpOnly: true,
              secure: process.env.NODE_ENV !== "Development",
            });

            res.status(200).send({
              message: message,
              success: true,
              user: u,
              expiresIn: jwt.expiresIn,
            });
          })
          .catch((error) => {
            console.log(error);
            const message = "Something went wrong. Please try again later";
            sendResponse(res, 500, message, false);
          });
      }
    });
  }
);

router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.clearCookie("auth");

  res.send({
    message: "Success",
    success: true,
  });
});

router.put(
  "/update/name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    user.firstName = firstName;
    user.lastName = lastName;
    user
      .save()
      .then((user) => {
        res.send({
          message: "Success",
          firstName: user.firstName,
          lastName: user.lastName,
          success: true,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({
          message: "Something went wrong. Please try again later",
          success: false,
        });
      });
  }
);

router.put(
  "/update/phonenumber",
  checkValidPhonenumber,
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user;
    const phoneNumber = req.body.phoneNumber;
    user.phoneNumber = phoneNumber;
    user
      .save()
      .then((user) => {
        res.send({
          message: "Success",
          phoneNumber: user.phoneNumber,
          success: true,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({
          message: "Something went wrong. Please try again later",
          success: false,
        });
      });
  }
);

router.put(
  "/update/password",
  passport.authenticate("jwt", { session: false }),
  [validateChangePasswordParams],
  (req, res) => {
    const user = req.user;
    const newPassword = req.body.newPassword;
    const saltHash = generatePassword(newPassword);
    user.password = saltHash.hash;
    user.salt = saltHash.salt;
    user
      .save()
      .then((user) => {
        res.send({
          message: "Success",
          success: true,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({
          message: "Something went wrong. Please try again later",
          success: false,
        });
      });
  }
);

router.put(
  "/update/profile-pic",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

module.exports = router;
