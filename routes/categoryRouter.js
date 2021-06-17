const categoryRouter = require("express").Router();
const Category = require("../models/Category");
const Product = require("../models/Product");
const verifyAdminToken = require("./verifyAdminToken");
const verifyToken = require("./verifyToken");

//
// Get all the categories
//
categoryRouter.get("/", verifyToken, async (req, res) => {
  const allCategories = await Category.find({});
  if (!allCategories) {
    return res.status(400).send("Error getting categories");
  }
  res.json({ allCategories });
});

//
// Get a category by id
//
categoryRouter.get("/:id", verifyToken, async (req, res) => {
  const getCategory = await Category.findById(req.params.id);
  if (!getCategory) {
    return res.status(400).send("Error getting category");
  }
  res.json({ getCategory });
});

//
// Get a category by title using search text (starts with)
//
categoryRouter.get("/title/:title", verifyToken, async (req, res) => {
  const getCategories = await Category.find({
    title: { $regex: `^${req.params.title}`, $options: "i" },
  });
  if (!getCategories) {
    return res.status(400).send("Error getting categories");
  }
  res.json({ getCategories });
});

//
// Update a category by id using the save mode to work
// asynchronous and with validation.
// Check if the title is different. If yes, the category title
// field on the products must also change.
//
categoryRouter.put("/:id", verifyAdminToken, async (req, res) => {
  const updateCategory = await Category.findById(req.params.id);
  if (!updateCategory) {
    return res.status(400).send("Error getting category");
  }

  // Save the actual category title in another variable
  // to use in products after the validation check.
  const checkCategoryTitle = updateCategory.title;

  updateCategory.title = req.body.title;
  updateCategory.description = req.body.description;
  updateCategory.color = req.body.color;
  updateCategory.discount = req.body.discount;
  updateCategory.discountExpiration = req.body.discountExpiration;

  let error = updateCategory.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  // Check if there is an update on title.
  // If there is a change, we must also update
  // the category field on products.
  if (checkCategoryTitle !== req.body.title) {
    const updateProducts = await Product.updateMany(
      { category: checkCategoryTitle },
      { $set: { category: req.body.title } }
    );

    if (!updateProducts) {
      return res
        .status(400)
        .send("Error updating category entries in products");
    }
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
// Delete a category by id.
// First check if a product uses this category.
// If yes, deleting the category is invalid.
// The user must first delete the products
// connected to this category.
//
categoryRouter.delete("/:id", verifyAdminToken, async (req, res) => {
  // Get the category data for the delete request
  const getCategory = await Category.findById(req.params.id);
  if (!getCategory) {
    return res.status(400).send("Error getting category");
  }

  // Check if the category to delete has connected products
  const getProduct = await Product.findOne({ category: getCategory.title });
  // If not, we delete the category
  if (!getProduct) {
    const deleteCategory = await Category.deleteOne({ _id: req.params.id });
    if (!deleteCategory) {
      return res.status(400).send("Error deleting category");
    }
    res.status(200).send("Deleting category was successful");
  } else {
    // The category has connected products and we cannot delete it
    return res.status(400).send("The category is not empty");
  }
});

module.exports = categoryRouter;
