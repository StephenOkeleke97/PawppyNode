const express = require("express");
const { Token } = require("../schema/schema");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

const {
  getPets,
  requestToken,
  getTypes,
  getBreed,
  getOrganizations,
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
            expires: (result.data.expires_in * 1000 + Date.now() - 240).toString(),
          });
          token.save((error) => {
            if (error) console.log(error);
            else next();
          });
        } else {
          tokenFromDB.token = result.data.access_token;
          tokenFromDB.expires = (
            result.data.expires_in * 1000 +
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

router.use(validateToken, function (req, res, next) {
    next();
});

router.get("/animals", function (req, res) {
  const params = {
    type: req.query.type,
    breed: req.query.breed,
    size: req.query.size,
    gender: req.query.gender,
    age: req.query.age,
    color: req.query.color,
    coat: req.query.coat,
    status: req.query.status,
    organization: req.query.organization,
    good_with_children: req.query["good_with_children"],
    good_with_cats: req.query["good_with_cats"],
    good_with_dogs: req.query["good_with_dogs"],
    house_trained: req.query["house_trained"],
    declawed: req.query["declawed"],
    special_needs: req.query["special_needs"],
    page: req.query.page,
    limit: req.query.limit
    // location: req.query.location,
    // distance: req.query.distance,
  }
  console.log(params);

  getPets(params)
    .then((response) => {
      console.log(response);
      res.send({
        message: "success",
        data: response.data,
      });
    })
    .catch((error) => {
      console.log(error.response);
      serverError(res);
    });
});

router.get("/types", function (req, res) {
  getTypes().then(response => {
    res.send({
        message: "success",
        types: response.data.types
    });
  }).catch(error => {
      console.log(error);
      serverError(res);
  });
});

router.get("/breed", function (req, res) {
    const type = req.query.type;
    getBreed(type).then(response => {
        res.send({
            message: "Success",
            breeds: response.data.breeds
        });
    }).catch(error => {
        console.log(error);
        serverError(res);
    });
});

router.get("/organizations", function (req, res) {
  getOrganizations().then(response => {
    res.send({
      message: "Success",
      organizations: response.data.organizations
    });
  }).catch(error => {
    console.log(error);
    serverError(res);
  });
})

module.exports = router;
