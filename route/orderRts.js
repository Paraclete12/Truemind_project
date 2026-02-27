const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderCont");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// POST /api/orders - Create order from cart
router.post("/", orderController.createOrder);

// GET /api/orders/:id - Get order details & status
router.get("/:id", orderController.getOrderDetails);

// PUT /api/orders/:id/status - Admin: update order status
router.put("/:id/status", authenticate, authorizeRoles("admin"), orderController.updateOrderStatus);

module.exports = router;
