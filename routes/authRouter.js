const authRouter = require("express").Router();
const User = require("../models/User");
const verifyAdminToken = require("./verifyAdminToken");
const verifyToken = require("./verifyToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRoles = require("../userRoles");

//
// New user registration
// Important: Only the admin can register new users
//
authRouter.post("/register", verifyAdminToken, async (req, res) => {
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).send("Email already exist");
  }

  // Check if the user role is valid
  if (!userRoles.includes(req.body.role)) {
    return res.status(400).send("Invalid user role");
  }

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    role: req.body.role,
    lastActive: req.body.lastActive,
  });

  let error = user.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  user.password = hashPassword;
  error = user.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await user.save();
  res.status(200).send("User registration was successful");
});

//
// User login
//
authRouter.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("Email not found");
  }

  const comparePassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!comparePassword) {
    return res.status(400).send("Wrong password");
  }

  const token = jwt.sign({ user }, process.env.SECRET);
  res.header("auth-token", token);
  res.json(token);
});

//
// Update the user profile.
// Only the logged in user can change the own profile.
//
authRouter.put("/update/:id", verifyToken, async (req, res) => {
  // Check if the user request is the same with the user profile.
  // If not, we cannot update the user profile.
  if (req.verified.user._id !== req.params.id) {
    return res.status(400).send("User profile request is invalid");
  }

  const updateUser = await User.findById(req.params.id);
  if (!updateUser) {
    return res.status(400).send("Error getting user profile");
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  updateUser.username = req.body.username;
  updateUser.email = req.body.email;
  updateUser.password = hashPassword;
  updateUser.firstname = req.body.firstname;
  updateUser.lastname = req.body.lastname;
  updateUser.role = req.body.role;
  updateUser.lastActive = req.body.lastActive;

  let error = updateUser.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await updateUser.save();
  res.status(200).send("User profile update was successful");
});

//
// Delete a user
// Only admins can delete users
// Admins can delete theyrselfs but not other admins
// and only if they are not the last admin on db
// To delete another admin it's possible only thru customer service
//
authRouter.delete("/delete/:id", verifyAdminToken, async (req, res) => {
  // Get the user profile we want to delete
  const getUserToDelete = await User.findById(req.params.id);
  if (!getUserToDelete) {
    return res.status(400).send("Error getting user profile");
  }

  // If the user role we want to delete is admin...
  if (getUserToDelete.role === "Admin") {
    // ...and if the user to delete is the same user request...
    if (getUserToDelete._id == req.verified.user._id) {
      // ...check if only one admin exist on database.
      User.countDocuments({ role: "Admin" }, function (err, adminCount) {
        if (err || adminCount < 2) {
          // If error or only one admin on database, don't delete and return
          return res.status(400).send("Error deleting user");
        }
      });
    } else {
      // If the user request is not the same user to delete,
      // don't delete and return
      return res.status(400).send("Error deleting user");
    }
  }

  // All conditions are met, delete the user profile
  const deleteUser = await User.deleteOne({ _id: req.params.id });
  if (!deleteUser) {
    return res.status(400).send("Error deleting user");
  }

  res.status(200).send("Deleting user was successful");
});

module.exports = authRouter;
