const userRouter = require("express").Router();
const verifyToken = require("./verifyToken");

userRouter.get("/", verifyToken, (req, res) => {
  res.json(req.user);
});

module.exports = userRouter;
