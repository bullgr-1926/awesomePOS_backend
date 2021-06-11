const userRouter = require("express").Router();
const User = require("../models/User");
const verifyToken = require("./verifyToken");
const verifyAdminToken = require("./verifyAdminToken");

//
// Root path accessible only to logged in users
//
userRouter.get("/", verifyToken, (req, res) => {
  res.status(200).send("You are logged in");
});

//
// Get the user profile (except password)
// for the logged in user
//
userRouter.get("/profile", verifyToken, async (req, res) => {
  const userProfile = await User.findById(req.verified.user._id);
  if (!userProfile) {
    return res.status(400).send("Error getting user profile");
  }
  res.json({ userProfile });
});

//
// Get all user profiles from db.
// Only admin can get this data
//
userRouter.get("/profiles", verifyAdminToken, async (req, res) => {
  const allProfiles = await User.find({});
  if (!allProfiles) {
    return res.status(400).send("Error getting user profiles");
  }

  res.json({ allProfiles });
});

module.exports = userRouter;
