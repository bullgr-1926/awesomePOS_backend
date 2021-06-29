const receiptRouter = require("express").Router();
const Receipt = require("../models/Receipt");
const verifyAdminToken = require("./verifyAdminToken");
const verifyToken = require("./verifyToken");

//
// Get all the receipts in descending order
//
receiptRouter.get("/", verifyToken, async (req, res) => {
  const allReceipts = await Receipt.find({}).sort({ createdAt: -1 }).limit(100);
  if (!allReceipts) {
    return res.status(400).send("Error getting receipt");
  }
  res.json({ allReceipts });
});

//
// Get all receipts by regular expression
//
receiptRouter.get("/:date", verifyToken, async (req, res) => {
  const getReceipts = await Receipt.find({
    createdAt: { $regex: `^${req.params.date}`, $options: "i" },
  });
  if (!getReceipts) {
    return res.status(400).send("Error getting receipts");
  }
  res.json({ getReceipts });
});

//
// Create a receipt using the save mode to work
// asynchronous and with validation
//
receiptRouter.post("/add_receipt", verifyToken, async (req, res) => {
  const newReceipt = new Receipt({
    products: req.body.products,
    userId: req.body.userId,
    createdAt: req.body.createdAt,
    tax: req.body.tax,
    subtotal: req.body.subtotal,
    taxtotal: req.body.taxtotal,
    grandtotal: req.body.grandtotal,
  });

  let error = newReceipt.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await newReceipt.save();
  res.status(200).send(newReceipt._id);
});

//
// Delete a category by id
//
receiptRouter.delete("/:id", verifyAdminToken, async (req, res) => {
  const deleteReceipt = await Receipt.deleteOne({ _id: req.params.id });
  if (!deleteReceipt) {
    return res.status(400).send("Error deleting receipt");
  }
  res.status(200).send("Deleting receipt was successful");
});

module.exports = receiptRouter;
