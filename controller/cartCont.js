const cartModel = require("../model/cart");
const { validateQuantity } = require("../utility/validation");
const { errorResponse, successResponse } = require("../utility/resp");
const db = require("../config/db");

// POST /api/cart/add
exports.addToCart = (req, res) => {
  const { userId, foodId, quantity } = req.body;

  if (!userId || !foodId) return errorResponse(res, "userId and foodId are required.");

  const qtyError = validateQuantity(quantity);
  if (qtyError) return errorResponse(res, qtyError);

  db.get(
    "SELECT * FROM foods WHERE id = ? AND is_available = 1",
    [foodId],
    (err, food) => {
      if (err) return errorResponse(res, err.message, 500);
      if (!food) return errorResponse(res, "Food item is not available.", 404);

      cartModel.findCartByUser(userId, (err, cart) => {
        if (err) return errorResponse(res, err.message, 500);
        const now = new Date().toISOString();

        const proceed = (cartId) => {
          cartModel.insertCartItem([cartId, foodId, quantity, food.price], (err) => {
            if (err) return errorResponse(res, err.message, 500);

            cartModel.getCartItems(cartId, (err, items) => {
              if (err) return errorResponse(res, err.message, 500);
              const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

              cartModel.updateCartTotal(total, now, cartId, () => {
                return successResponse(res, { cartId, total }, "Item added to cart.");
              });
            });
          });
        };

        if (!cart) {
          cartModel.createCart(userId, now, (err, cartId) => {
            if (err) return errorResponse(res, err.message, 500);
            proceed(cartId);
          });
        } else {
          proceed(cart.id);
        }
      });
    }
  );
};

// GET /api/cart/:userId
exports.viewCart = (req, res) => {
  const { userId } = req.params;

  cartModel.getCartWithItems(userId, (err, cart) => {
    if (err) return errorResponse(res, err.message, 500);
    if (!cart) return successResponse(res, { items: [], total: 0 }, "Cart is empty.");
    return successResponse(res, cart, "Cart retrieved successfully.");
  });
};

// POST /api/cart/clear
exports.clearCart = (req, res) => {
  const { userId } = req.body;

  if (!userId) return errorResponse(res, "userId is required.");

  cartModel.findCartByUser(userId, (err, cart) => {
    if (err) return errorResponse(res, err.message, 500);
    if (!cart) return errorResponse(res, "Cart not found.", 404);

    cartModel.clearCart(cart.id, (err) => {
      if (err) return errorResponse(res, err.message, 500);

      cartModel.updateCartTotal(0, new Date().toISOString(), cart.id, () => {
        return successResponse(res, {}, "Cart cleared successfully.");
      });
    });
  });
};
