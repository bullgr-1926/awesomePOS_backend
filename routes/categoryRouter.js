const categoryRouter = require("express").Router();
const Category = require("../models/Category");
const verifyAdminToken = require("./verifyAdminToken");

categoryRouter.get("/", verifyAdminToken, async (req, res) => {
  const allCategories = await Category.find({});
  if (!allCategories) {
    return res.status(400).send("Error getting Categories");
  }
  res.json({ allCategories });
});

categoryRouter.post("/addCategory", verifyAdminToken, async (req, res) => {
  const newCategory = new Category({
    title: req.body.title,
    description: req.body.description,
    color: req.body.color,
    discount: req.body.discount,
    discountExpiration: discountExpiration,
  });

  let error = newCategory.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  newCategory.save();
  res.json({ newCategory });
});

module.exports = categoryRouter;
