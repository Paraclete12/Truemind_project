const orderModel = require("../model/order");
const db = require("../config/db");
const { errorResponse, successResponse } = require("../utility/resp");
const { ORDER_STATUS } = require("../utility/status");

// POST /api/orders - Create order from cart
exports.createOrder = (req, res) => {
  const { userId } = req.body;

  if (!userId) return errorResponse(res, "userId is required.");

  db.get("SELECT * FROM carts WHERE user_id = ?", [userId], (err, cart) => {
    if (err) return errorResponse(res, err.message, 500);
    if (!cart) return errorResponse(res, "Cart not found. Add items first.", 404);

    db.all(
      `SELECT ci.*, f.is_available, f.price AS current_price
       FROM cart_items ci
       JOIN foods f ON ci.food_id = f.id
       WHERE ci.cart_id = ?`,
      [cart.id],
      (err, items) => {
        if (err) return errorResponse(res, err.message, 500);
        if (!items || items.length === 0) return errorResponse(res, "Cart is empty.", 400);

        // Check if any item became unavailable
        const unavailable = items.filter(i => i.is_available === 0);
        if (unavailable.length > 0) {
          return errorResponse(
            res,
            `Some items are no longer available: food IDs ${unavailable.map(i => i.food_id).join(", ")}`,
            400
          );
        }

        const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
        const now = new Date().toISOString();

        orderModel.createOrder([userId, total, now, now], (err, orderId) => {
          if (err) return errorResponse(res, err.message, 500);

          let inserted = 0;
          items.forEach((item) => {
            orderModel.insertOrderItem(
              [orderId, item.food_id, item.quantity, item.price],
              (err) => {
                if (err) console.error("Error inserting order item:", err.message);
                inserted++;
                if (inserted === items.length) {
                  // Clear cart after order
                  db.run("DELETE FROM cart_items WHERE cart_id = ?", [cart.id], () => {
                    db.run("UPDATE carts SET total_amount = 0, updated_at = ? WHERE id = ?", [now, cart.id]);
                  });

                  return successResponse(res, { orderId, total, status: "Pending" }, "Order placed successfully.");
                }
              }
            );
          });
        });
      }
    );
  });
};

// GET /api/orders/:id - Get order details and status
exports.getOrderDetails = (req, res) => {
  const orderId = req.params.id;

  orderModel.getOrderById(orderId, (err, order) => {
    if (err) return errorResponse(res, err.message, 500);
    if (!order) return errorResponse(res, "Order not found.", 404);

    orderModel.getOrderItems(orderId, (err, items) => {
      if (err) return errorResponse(res, err.message, 500);
      return successResponse(res, { order, items }, "Order details retrieved.");
    });
  });
};

// PUT /api/orders/:id/status - Admin: update order status
exports.updateOrderStatus = (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  if (!status) return errorResponse(res, "status is required.");
  if (!ORDER_STATUS.includes(status)) {
    return errorResponse(res, `Invalid status. Must be one of: ${ORDER_STATUS.join(", ")}`);
  }

  orderModel.getOrderById(orderId, (err, order) => {
    if (err) return errorResponse(res, err.message, 500);
    if (!order) return errorResponse(res, "Order not found.", 404);

    // Prevent updating a completed or cancelled order
    if (order.status === "Completed" || order.status === "Cancelled") {
      return errorResponse(res, `Cannot update a ${order.status} order.`, 400);
    }

    db.run(
      "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?",
      [status, new Date().toISOString(), orderId],
      function (err) {
        if (err) return errorResponse(res, err.message, 500);
        return successResponse(res, { orderId, status }, "Order status updated.");
      }
    );
  });
};
