const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartCont");

// POST /api/cart/add - Add meal to cart
router.post("/add", cartController.addToCart);

// GET /api/cart/:userId - View cart
router.get("/:userId", cartController.viewCart);

// POST /api/cart/clear - Clear cart
router.post("/clear", cartController.clearCart);

module.exports = router;
