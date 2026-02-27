require("dotenv").config();

const jwt = require("jsonwebtoken");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user in database
    const user = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare password (example only)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Create token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4. Send token
    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    next(err);
  }
};
