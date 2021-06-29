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
// Method to check if a barcode already exist before
// we create the product
//
const checkBarcode = async (productBarcode) => {
  const barcodeExist = await Product.findOne({ barcode: productBarcode });
  if (barcodeExist) {
    return true;
  } else {
    return false;
  }
};

//
// Get all the products
//
productRouter.get("/", verifyToken, async (req, res) => {
  const allProducts = await Product.find({}).limit(100);
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
// asynchronous and with validation.
// Check if the barcode must change. If yes, check first
// if the barcode already exist in database.
// The barcode must be unique for each product.
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

  // Check if there is a barcode change request.
  // If yes, check if the barcode already exist in database.
  // If the barcode already exist, we cannot update the product.
  if (updateProduct.barcode !== req.body.barcode) {
    const barcodeExist = await checkBarcode(req.body.barcode);
    if (barcodeExist) {
      return res.status(400).send("The barcode already exist in database");
    }
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
// asynchronous and with validation.
// Check first if the barcode already exist in database.
// The barcode must be unique for each product.
//
productRouter.post("/add_product", verifyAdminToken, async (req, res) => {
  // Check if the given category for this product exist.
  // If not, we cannot create the product
  const categoryExist = await checkCategory(req.body.category);
  if (!categoryExist) {
    return res.status(400).send("The category does not exist");
  }

  // If the barcode already exist, we cannot create the product.
  const barcodeExist = await checkBarcode(req.body.barcode);
  if (barcodeExist) {
    return res.status(400).send("The barcode already exist in database");
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
