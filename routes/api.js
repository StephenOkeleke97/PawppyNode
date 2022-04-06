const express = require("express");
const router = express.Router();

router.get("/v1/favorites", (req, res) => {
    res.send("Working");
});

router.get("/v1/adopted", (req, res) => {

});

module.exports = router;