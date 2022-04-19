const express = require("express");
const router = express.Router();

const apiRouter = require("./api");
const userRouter = require("./user");
const petfinderRouter = require("./petfinder");

router.use("/api", apiRouter);
router.use("/user", userRouter);
router.use("/petfinder", petfinderRouter);

module.exports = router;
