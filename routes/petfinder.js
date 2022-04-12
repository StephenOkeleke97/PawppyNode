const express = require("express");
const { Token } = require("../schema/schema");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

const {
  getPets,
  requestToken,
  getTypes,
} = require("../petfinder/petfinderService");

/**
 * Checks if a valid token exists in database.
 * If a token does not exist or is expired, request
 * for a new token.
 *
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */
function validateToken(req, res, next) {
  Token.findOne({ name: "jwt" }).then((result) => {
    const dateTime = Number(result.expires);
    if (!result || Date.now() > dateTime) {
      refreshToken(res, next);
    } else {
      next();
    }
  });
}

/**
 * Request for a new access token from petfinder
 * and store token in database.
 *
 * @param {*} res response object
 * @param {*} next next function
 */
function refreshToken(res, next) {
  const id = process.env.PF_API_KEY;
  const secret = process.env.PF_SECRET;

  requestToken(id, secret)
    .then((result) => {
      Token.findOne({ name: "jwt" }).then((tokenFromDB) => {
        if (!tokenFromDB) {
          const token = new Token({
            name: "jwt",
            token: result.data.access_token,
            expires: (result.data.expires_in + Date.now() - 240).toString(),
          });
          token.save((error) => {
            if (error) console.log(error);
            else next();
          });
        } else {
          tokenFromDB.token = result.data.access_token;
          tokenFromDB.expires = (
            result.data.expires_in +
            Date.now() -
            240
          ).toString();
          tokenFromDB.save((error) => {
            if (error) console.log(error);
            else next();
          });
        }
      });
    })
    .catch((error) => {
      console.log(error);
      serverError(res);
    });
}

/**
 * Send 500 error to client.
 *
 * @param {*} res response object
 */
function serverError(res) {
  res.status(500).send({
    message: "Something went wrong. Please try again later",
  });
}

router.get("/pets", [validateToken], function (req, res) {
  getPets()
    .then((response) => {
      res.send({
        message: "success",
        data: response.data,
      });
    })
    .catch((error) => {
      console.log(error);
      serverError(res);
    });
});

router.get("/types", [validateToken], function (req, res) {
  getTypes().then(response => {
    res.send({
        message: "success",
        data: response.data
    });
  }).catch(error => {
      console.log(error);
      serverError(res);
  })
});

module.exports = router;
