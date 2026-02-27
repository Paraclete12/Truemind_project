const userModel = require("../model/user");
const { generateOTP } = require("../utility/otp");
const { validateSignup } = require("../utility/validation");
const { errorResponse, successResponse } = require("../utility/resp");
const jwt = require("jsonwebtoken");

// POST /api/users/signup
exports.signup = (req, res) => {
  const { email, phone, referral_code } = req.body;

  const validationError = validateSignup(email, phone);
  if (validationError) return errorResponse(res, validationError);

  userModel.findUserByEmailOrPhone(email, phone, (err, existingUser) => {
    if (err) return errorResponse(res, err.message, 500);
    if (existingUser) return errorResponse(res, "User already exists with that email or phone.");

    const otp = generateOTP();
    const now = new Date();
    const expires = new Date(now.getTime() + 5 * 60000); // OTP valid 5 minutes

    const data = [
      email || null,
      phone || null,
      referral_code || null,
      otp,
      expires.toISOString(),
      now.toISOString(),
      now.toISOString()
    ];

    userModel.createUser(data, (err, userId) => {
      if (err) return errorResponse(res, err.message, 500);

      // In production, send OTP via email/SMS. Here we return it for simulation.
      return successResponse(
        res,
        { userId, otp },
        "Signup successful. Please verify your account with the OTP."
      );
    });
  });
};

// POST /api/users/verify
exports.verify = (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) return errorResponse(res, "userId and otp are required.");

  userModel.verifyOTP(userId, otp, (err, user) => {
    if (err) return errorResponse(res, err.message, 500);
    if (!user) return errorResponse(res, "Invalid or expired OTP.", 400);

    userModel.markVerified(userId, (err) => {
      if (err) return errorResponse(res, err.message, 500);

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return successResponse(res, { token }, "Account verified successfully.");
    });
  });
};

// POST /api/users/login
exports.login = (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) return errorResponse(res, "Email or phone is required.");

  userModel.findUserByEmailOrPhone(email, phone, (err, user) => {
    if (err) return errorResponse(res, err.message, 500);
    if (!user) return errorResponse(res, "User not found.", 404);
    if (!user.is_verified) return errorResponse(res, "Account not verified. Please verify your OTP.", 403);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return successResponse(res, { token, role: user.role }, "Login successful.");
  });
};
