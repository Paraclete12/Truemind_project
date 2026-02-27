const db = require("../config/db");

exports.findCartByUser = (userId, callback) => {
  db.get("SELECT * FROM carts WHERE user_id = ?", [userId], callback);
};

exports.createCart = (userId, timestamp, callback) => {
  db.run(
    "INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, ?, ?)",
    [userId, timestamp, timestamp],
    function (err) {
      callback(err, this?.lastID);
    }
  );
};

exports.insertCartItem = (data, callback) => {
  db.run(
    "INSERT INTO cart_items (cart_id, food_id, quantity, price) VALUES (?, ?, ?, ?)",
    data,
    callback
  );
};

exports.getCartItems = (cartId, callback) => {
  db.all(
    "SELECT quantity, price FROM cart_items WHERE cart_id = ?",
    [cartId],
    callback
  );
};

exports.updateCartTotal = (total, timestamp, cartId, callback) => {
  db.run(
    "UPDATE carts SET total_amount = ?, updated_at = ? WHERE id = ?",
    [total, timestamp, cartId],
    callback
  );
};

exports.clearCart = (cartId, callback) => {
  db.run("DELETE FROM cart_items WHERE cart_id = ?", [cartId], callback);
};


exports.getCartWithItems = (userId, callback) => {
  const db = require("../config/db");
  db.get("SELECT * FROM carts WHERE user_id = ?", [userId], (err, cart) => {
    if (err) return callback(err);
    if (!cart) return callback(null, null);
    db.all(
      `SELECT ci.id, ci.quantity, ci.price, f.name, f.image_url
       FROM cart_items ci
       JOIN foods f ON ci.food_id = f.id
       WHERE ci.cart_id = ?`,
      [cart.id],
      (err, items) => {
        if (err) return callback(err);
        callback(null, { ...cart, items });
      }
    );
  });
};
