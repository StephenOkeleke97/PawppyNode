const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get(
  "/v1/favorites",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(req.user.favorites);
  }
);

router.get(
  "/v1/adopted",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(req.user.adopted);
  }
);

module.exports = router;
