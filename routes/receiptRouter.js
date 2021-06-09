const receiptRouter = require("express").Router();
const Receipt = require("../models/Receipt");
const verifyAdminToken = require("./verifyAdminToken");
const verifyToken = require("./verifyToken");

//
// Get all the receipts
//
receiptRouter.get("/", verifyToken, async (req, res) => {
  const allReceipts = await Receipt.find({});
  if (!allReceipts) {
    return res.status(400).send("Error getting receipt");
  }
  res.json({ allReceipts });
});

//
// Get a receipt by id
//
receiptRouter.get("/:id", verifyToken, async (req, res) => {
  const getReceipt = await Receipt.findById(req.params.id);
  if (!getReceipt) {
    return res.status(400).send("Error getting receipt");
  }
  res.json({ getReceipt });
});

//
// Create a receipt using the save mode to work
// asynchronous and with validation
//
receiptRouter.post("/add_receipt", verifyToken, async (req, res) => {
  const newReceipt = new Receipt({
    products: req.body.products,
    discount: req.body.discount,
    subTotal: req.body.subTotal,
    total: req.body.total,
  });

  let error = newReceipt.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await newReceipt.save();
  res.status(200).send("Receipt creation was successful");
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
