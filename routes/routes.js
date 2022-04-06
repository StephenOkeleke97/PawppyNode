const express = require("express");
const router = express.Router();

const apiRouter = require("./api");
const userRouter = require("./user");

router.use("/api", apiRouter);
router.use("/user", userRouter);

module.exports = router;