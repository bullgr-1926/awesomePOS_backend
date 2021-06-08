const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require("cors");

// Connection port
const port = process.env.PORT || 3002;

// App setup tools
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Router declarations
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const categoryRouter = require("./routes/categoryRouter");
const productRouter = require("./routes/productRouter");

// Router setup
app.use("/user", authRouter);
app.use("/", userRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);

// Connect to Database
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(port, console.log(`Server connected at port ${port}`));
