const db = require("../config/db");

exports.beginTransaction = () => db.run("BEGIN TRANSACTION");
exports.commit = () => db.run("COMMIT");
exports.rollback = () => db.run("ROLLBACK");

exports.createOrder = (data, callback) => {
  const query = `
    INSERT INTO orders (user_id, total_amount, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, data, function (err) {
    callback(err, this?.lastID);
  });
};

exports.insertOrderItem = (data, callback) => {
  db.run(
    "INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)",
    data,
    callback
  );
};

exports.getOrderById = (orderId, callback) => {
  db.get("SELECT * FROM orders WHERE id = ?", [orderId], callback);
};

exports.getOrderItems = (orderId, callback) => {
  db.all(
    `SELECT oi.*, f.name 
     FROM order_items oi
     JOIN foods f ON oi.food_id = f.id
     WHERE oi.order_id = ?`,
    [orderId],
    callback
  );
};
