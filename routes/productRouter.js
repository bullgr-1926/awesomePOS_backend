const productRouter = require("express").Router();
const Product = require("../models/Product");
const Category = require("../models/Category");
const verifyAdminToken = require("./verifyAdminToken");
const verifyToken = require("./verifyToken");

//
// Method to check if a category exist before
// we create the product
//
const checkCategory = async (categoryTitle) => {
  const categoryExist = await Category.findOne({ title: categoryTitle });
  if (categoryExist) {
    return true;
  } else {
    return false;
  }
};

//
// Get all the products
//
productRouter.get("/", verifyToken, async (req, res) => {
  const allProducts = await Product.find({});
  if (!allProducts) {
    return res.status(400).send("Error getting products");
  }
  res.json({ allProducts });
});

//
// Get a product by id
//
productRouter.get("/:id", verifyToken, async (req, res) => {
  const getProduct = await Product.findById(req.params.id);
  if (!getProduct) {
    return res.status(400).send("Error getting product");
  }
  res.json({ getProduct });
});

//
// Get a product by title using search text (starts with)
//
productRouter.get("/title/:title", verifyToken, async (req, res) => {
  const getProducts = await Product.find({
    title: { $regex: `^${req.params.title}`, $options: "i" },
  });
  if (!getProducts) {
    return res.status(400).send("Error getting products");
  }
  res.json({ getProducts });
});

//
// Get a product by barcode
//
productRouter.get("/barcode/:barcode", verifyToken, async (req, res) => {
  const getProduct = await Product.findOne({ barcode: req.params.barcode });
  if (!getProduct) {
    return res.status(400).send("Error getting products");
  }
  res.json({ getProduct });
});

//
// Get a product by category to filter the products
//
productRouter.post("/category", verifyToken, async (req, res) => {
  const getProducts = await Product.find({ category: req.body.category });
  if (!getProducts) {
    return res.status(400).send("Error getting products");
  }
  res.json({ getProducts });
});

//
// Update a product by id using the save mode to work
// asynchronous and with validation
//
productRouter.put("/:id", verifyAdminToken, async (req, res) => {
  const updateProduct = await Product.findById(req.params.id);
  if (!updateProduct) {
    return res.status(400).send("Error getting product");
  }

  // Check if the given category for this product exist.
  // If not, we cannot update the product
  const categoryExist = await checkCategory(req.body.category);
  if (!categoryExist) {
    return res.status(400).send("The category does not exist");
  }

  updateProduct.title = req.body.title;
  updateProduct.description = req.body.description;
  updateProduct.category = req.body.category;
  updateProduct.price = req.body.price;
  updateProduct.barcode = req.body.barcode;
  updateProduct.discount = req.body.discount;
  updateProduct.discountExpiration = req.body.discountExpiration;

  let error = updateProduct.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await updateProduct.save();
  res.status(200).send("Product update was successful");
});

//
// Create a product using the save mode to work
// asynchronous and with validation
//
productRouter.post("/add_product", verifyAdminToken, async (req, res) => {
  const productExist = await Product.findOne({ title: req.body.title });
  if (productExist) {
    return res.status(400).send("The product already exist");
  }

  // Check if the given category for this product exist.
  // If not, we cannot create the product
  const categoryExist = await checkCategory(req.body.category);
  if (!categoryExist) {
    return res.status(400).send("The category does not exist");
  }

  const newProduct = new Product({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    barcode: req.body.barcode,
    discount: req.body.discount,
    discountExpiration: req.body.discountExpiration,
  });

  let error = newProduct.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await newProduct.save();
  res.status(200).send("Product creation was successful");
});

//
// Delete a product by id
//
productRouter.delete("/:id", verifyAdminToken, async (req, res) => {
  const deleteProduct = await Product.deleteOne({ _id: req.params.id });
  if (!deleteProduct) {
    return res.status(400).send("Error deleting product");
  }
  res.status(200).send("Deleting product was successful");
});

module.exports = productRouter;
