const storeRouter = require("express").Router();
const Store = require("../models/Store");
const verifyAdminToken = require("./verifyAdminToken");
const verifyToken = require("./verifyToken");

//
// Get the store info
//
storeRouter.get("/", verifyToken, async (req, res) => {
  const store = await Store.find({});
  if (!store) {
    return res.status(400).send("Error getting store info");
  }
  res.json({ store });
});

//
// Update the store using the save mode to work
// asynchronous and with validation
//
storeRouter.put("/:id", verifyAdminToken, async (req, res) => {
  const updateStore = await Store.find({});
  if (!updateStore) {
    return res.status(400).send("Error getting store info");
  }

  updateStore.title = req.body.title;
  updateStore.discount = req.body.discount;
  updateStore.discountExpiration = req.body.discountExpiration;
  updateStore.tax = req.body.tax;
  updateStore.currency = req.body.currency;
  updateStore.street = req.body.street;
  updateStore.city = req.body.city;
  updateStore.region = req.body.region;
  updateStore.postcode = req.body.postcode;
  updateStore.phone = req.body.phone;
  updateStore.country = req.body.country;

  let error = updateStore.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await updateStore.save();
  res.status(200).send("Store info update was successful");
});

//
// Create a store using the save mode to work
// asynchronous and with validation
// Note: Only one store entry can be exist
//
storeRouter.post("/add_store", verifyAdminToken, async (req, res) => {
  const storeExist = await Store.find({});
  if (storeExist) {
    return res.status(400).send("Store info already exist");
  }

  const newStore = new Store({
    title: req.body.title,
    discount: req.body.discount,
    discountExpiration: req.body.discountExpiration,
    tax: req.body.tax,
    currency: req.body.currency,
    street: req.body.street,
    city: req.body.city,
    region: req.body.region,
    postcode: req.body.postcode,
    phone: req.body.phone,
    country: req.body.country,
  });

  let error = newStore.validateSync();
  if (error) {
    return res.status(400).send(error);
  }

  await newStore.save();
  res.status(200).send("Store creation was successful");
});

module.exports = storeRouter;
