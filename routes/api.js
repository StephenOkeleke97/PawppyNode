const express = require("express");
const passport = require("passport");
const router = express.Router();

function validateRecentView(req, res, next) {
  const recent = req.recent;

  if (!recent || !(typeof recent === "object")) {
    res.send({
      message: "Invalid parameters",
      success: false,
    });
  } else {
    next();
  }
}

function validateFavorite(req, res, next) {
  const favorite = req.favorite;

  if (!favorite || !(typeof favorite === "object")) {
    res.send({
      message: "Invalid parameters",
      success: false,
    });
  } else {
    next();
  }
}

router.get(
  "/v1/favorites",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(req.user.favorites);
  }
);

router.put(
  "/v1/favorites/add",
  [validateFavorite],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

router.put(
  "/v1/favorites/remove",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

router.get(
  "/v1/recent-views",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

router.put(
  "/v1/recent-views/add",
  [validateRecentView],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user;
    const recentView = req.recent;

    user.recentlyViewed.push(recentView);

    user
      .save()
      .then(() => {
        res.send({
          message: "Success",
          success: true,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({
          message: "Something went wrong. Please try again later.",
          success: false,
        });
      });
  }
);

module.exports = router;
