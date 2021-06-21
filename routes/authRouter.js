const authRouter = require("express").Router();
const User = require("../models/User");
const verifyAdminToken = require("./verifyAdminToken");
const verifyToken = require("./verifyToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRoles = require("../userRoles");
const defaultDate = require("../models/Helperfunctions");

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

  if (!req.body.password) {
    return res.status(400).send("Password not found");
  }

  const comparePassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!comparePassword) {
    return res.status(400).send("Wrong password");
  }

  // Update the last active date
  user.lastActive = defaultDate.createLocaleString();

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

  // Check if the user want to change the actual email.
  // If yes, check if the new email already exist on db.
  // If email exist, the request is invalid.
  if (req.verified.user.email !== req.body.email) {
    const newEmail = await User.findOne({ email: req.body.email });
    if (newEmail) {
      return res.status(400).send("Email already exist");
    }
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(400).send("Error getting user profile");
  }

  // Set the new data from request and validate first
  // before we hash the password.
  user.username = req.body.username;
  user.email = req.body.email;
  user.firstname = req.body.firstname;
  user.lastname = req.body.lastname;
  user.role = req.body.role;
  user.lastActive = defaultDate.createLocaleString();

  // Set the password only if the user wants to change it.
  // Else it remains the same and we don't need to encrypt it.
  if (req.body.password) {
    user.password = req.body.password;

    // Validate first the new password
    let error = user.validateSync();
    if (error) {
      return res.status(400).send(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Update the new hashed password to the new user object
    user.password = hashPassword;
  } else {
    // Else set the default password
    user.password = req.verified.user.password;
  }

  // Validate a last time before save to db
  error = user.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  // Save the changes to db
  await user.save();

  // Return the updated user token
  const token = jwt.sign({ user }, process.env.SECRET);
  res.header("auth-token", token);
  res.json(token);
});

//
// Delete a user
// Only admins can delete other users.
// Admins can delete theyr own profile but not other admins
// and only if they are not the last admin on db.
// To delete another admin it's possible only thru customer service.
//
authRouter.delete("/delete_user/:id", verifyAdminToken, async (req, res) => {
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
          return res
            .status(400)
            .send(
              "Error deleting user profile. There is only one admin in database."
            );
        }
      });
    } else {
      // If the user request is not the same user to delete,
      // don't delete and return
      return res
        .status(400)
        .send(
          "Error deleting user profile. The admin profile is not the same with the request."
        );
    }
  }

  // All conditions are met, delete the user profile
  const deleteUser = await User.deleteOne({ _id: req.params.id });
  if (!deleteUser) {
    return res.status(400).send("Error deleting user profile");
  }

  res.status(200).send("Deleting user was successful");
});

//
// Delete a profile
// Users can delete theyr own profile
// and only if they are not the last admin on db.
//
authRouter.delete("/delete_profile/:id", verifyToken, async (req, res) => {
  // Get the user profile we want to delete
  const getUserToDelete = await User.findById(req.params.id);
  if (!getUserToDelete) {
    return res.status(400).send("Error getting user profile");
  }

  // The user must the same with the delete request
  if (getUserToDelete._id != req.verified.user._id) {
    return res
      .status(400)
      .send(
        "Error deleting user profile. The profile is not the same with the request."
      );
  }

  // If the user role we want to delete is admin...
  if (getUserToDelete.role === "Admin") {
    // ...check if only one admin exist on database.
    User.countDocuments({ role: "Admin" }, function (err, adminCount) {
      if (err || adminCount < 2) {
        // If error or only one admin on database, don't delete and return
        return res
          .status(400)
          .send(
            "Error deleting user profile. There is only one admin in database."
          );
      }
    });
  }

  // All conditions are met, delete the user profile
  const deleteUser = await User.deleteOne({ _id: req.params.id });
  if (!deleteUser) {
    return res.status(400).send("Error deleting user profile");
  }

  res.status(200).send("Deleting user was successful");
});

module.exports = authRouter;
