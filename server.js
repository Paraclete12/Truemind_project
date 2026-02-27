const express = require("express");
require("dotenv").config();
const initializeDatabase = require("./config/initDb");

const userRoutes = require("./route/userRts");
const cartRoutes = require("./route/cartRts");
const orderRoutes = require("./route/orderRts");
const foodRoutes = require("./route/foodRts");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(express.json());

initializeDatabase();


// ROUTE REGISTRATION

app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/foods", foodRoutes);
app.use(errorHandler);

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Chuks Kitchen API running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
