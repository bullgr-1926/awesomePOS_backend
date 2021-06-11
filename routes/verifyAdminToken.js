const jwt = require("jsonwebtoken");

const verifyAdminToken = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(400).send("Access denied");
  }

  try {
    const verified = jwt.verify(token, process.env.SECRET);
    req.verified = verified;

    if (req.verified.user.role === "Admin") {
      next();
    } else {
      return res.status(400).send("Access denied");
    }
  } catch (err) {
    res.send("error");
  }
};

module.exports = verifyAdminToken;
