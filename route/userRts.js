const express = require("express");
const router = express.Router();

const { signup, verify, login } = require("../controller/userCont");

// POST /api/users/signup - Register with email or phone
router.post("/signup", signup);

// POST /api/users/verify - Verify OTP
router.post("/verify", verify);

// POST /api/users/login - Login (returns JWT)
router.post("/login", login);

module.exports = router;
