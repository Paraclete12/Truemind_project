// initDb.js
const db = require("./db");

function initializeDatabase() {
  db.serialize(() => {
    console.log("Initializing database...");

    // Enable Foreign Keys
    db.run("PRAGMA foreign_keys = ON;", (err) => {
      if (err) {
        console.error("Failed to enable foreign keys:", err.message);
      }
    });

    // USERS TABLE

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        referral_code TEXT,
        otp TEXT,
        otp_expires_at TEXT,
        is_verified INTEGER DEFAULT 0 CHECK (is_verified IN (0,1)),
        role TEXT DEFAULT 'customer' CHECK (role IN ('customer','admin')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CHECK (email IS NOT NULL OR phone IS NOT NULL)
      )
    `);

    // ==============================
    // FOODS TABLE
    // ==============================
    db.run(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL CHECK (price >= 0),
        is_available INTEGER DEFAULT 1 CHECK (is_available IN (0,1)),
        image_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // ==============================
    // CARTS TABLE
    // ==============================
    db.run(`
      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL DEFAULT 0 CHECK (total_amount >= 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ==============================
    // CART ITEMS TABLE
    // ==============================
    db.run(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price REAL NOT NULL CHECK (price >= 0),
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id)
      )
    `);

    // ORDERS TABLE

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL CHECK (total_amount >= 0),
        status TEXT DEFAULT 'Pending'
          CHECK (status IN (
            'Pending',
            'Confirmed',
            'Preparing',
            'Out for Delivery',
            'Completed',
            'Cancelled'
          )),
        payment_status TEXT DEFAULT 'Pending'
          CHECK (payment_status IN ('Pending','Paid','Failed')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // ORDER ITEMS TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price REAL NOT NULL CHECK (price >= 0),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id)
      )
    `);

    // RATINGS TABLE (Optional)
    
    db.run(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (food_id) REFERENCES foods(id)
      )
    `);

    console.log("Database initialized successfully.");
  });
}

module.exports = initializeDatabase;
