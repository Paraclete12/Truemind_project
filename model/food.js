const db = require("../config/db");

exports.getAllFoods = (callback) => {
  db.all("SELECT * FROM foods WHERE is_available = 1", [], callback);
};

exports.createFood = ({ name, description, price, image_url }, callback) => {
  const now = new Date().toISOString();
  db.run(
    "INSERT INTO foods (name, description, price, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [name, description || null, price, image_url || null, now, now],
    function (err) {
      callback(err, this?.lastID);
    }
  );
};

exports.updateFood = (id, { name, description, price, is_available, image_url }, callback) => {
  const now = new Date().toISOString();
  db.run(
    `UPDATE foods SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      is_available = COALESCE(?, is_available),
      image_url = COALESCE(?, image_url),
      updated_at = ?
     WHERE id = ?`,
    [name, description, price, is_available, image_url, now, id],
    function (err) {
      callback(err);
    }
  );
};

exports.getFoodById = (id, callback) => {
  db.get("SELECT * FROM foods WHERE id = ?", [id], callback);
};
