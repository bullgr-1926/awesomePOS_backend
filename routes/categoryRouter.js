const categoryRouter = require("express").Router();
const Category = require("../models/Category");
const verifyAdminToken = require("./verifyAdminToken");
const verifyToken = require("./verifyToken");

//
// Get all the categories
//
categoryRouter.get("/", verifyToken, async (req, res) => {
  const allCategories = await Category.find({});
  if (!allCategories) {
    return res.status(400).send("Error getting Categories");
  }
  res.json({ allCategories });
});

//
// Get a category by id
//
categoryRouter.get("/:id", verifyToken, async (req, res) => {
  const getCategory = await Category.findById(req.params.id);
  if (!getCategory) {
    return res.status(400).send("Error getting Category");
  }
  res.json({ getCategory });
});

//
// Update a category by id using the save mode to work
// asynchronous and with validation
//
categoryRouter.put("/:id", verifyAdminToken, async (req, res) => {
  const updateCategory = await Category.findById(req.params.id);
  if (!updateCategory) {
    return res.status(400).send("Error getting Category");
  }

  updateCategory.title = req.body.title;
  updateCategory.description = req.body.description;
  updateCategory.color = req.body.color;
  updateCategory.discount = req.body.discount;
  updateCategory.discountExpiration = req.body.discountExpiration;

  let error = updateCategory.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await updateCategory.save();
  res.status(200).send("Category update was successful");
});

//
// Create a category using the save mode to work
// asynchronous and with validation
//
categoryRouter.post("/add_category", verifyAdminToken, async (req, res) => {
  const categoryExist = await Category.findOne({ title: req.body.title });
  if (categoryExist) {
    return res.status(400).send("The category already exist");
  }

  const newCategory = new Category({
    title: req.body.title,
    description: req.body.description,
    color: req.body.color,
    discount: req.body.discount,
    discountExpiration: req.body.discountExpiration,
  });

  let error = newCategory.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await newCategory.save();
  res.status(200).send("Category creation was successful");
});

//
// Delete a category by id
//
categoryRouter.delete("/:id", verifyAdminToken, async (req, res) => {
  const deleteCategory = await Category.deleteOne({ _id: req.params.id });
  if (!deleteCategory) {
    return res.status(400).send("Error deleting Category");
  }
  res.status(200).send("Deleting category was successful");
});

module.exports = categoryRouter;
