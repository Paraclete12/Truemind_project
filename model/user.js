const db = require("../config/db");

exports.findUserByEmailOrPhone = (email, phone, callback) => {
  db.get(
    "SELECT * FROM users WHERE email = ? OR phone = ?",
    [email || null, phone || null],
    callback
  );
};

exports.createUser = (data, callback) => {
  const query = `
    INSERT INTO users 
    (email, phone, referral_code, otp, otp_expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, data, function (err) {
    callback(err, this?.lastID);
  });
};

exports.findUserById = (id, callback) => {
  db.get("SELECT * FROM users WHERE id = ?", [id], callback);
};

exports.verifyOTP = (userId, otp, callback) => {
  db.get(
    "SELECT * FROM users WHERE id = ? AND otp = ? AND otp_expires_at > ?",
    [userId, otp, new Date().toISOString()],
    callback
  );
};

exports.markVerified = (userId, callback) => {
  db.run(
    "UPDATE users SET is_verified = 1, otp = NULL, otp_expires_at = NULL, updated_at = ? WHERE id = ?",
    [new Date().toISOString(), userId],
    callback
  );
};
