const Joi = require("joi");

exports.signupSchema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().min(7),
  referral_code: Joi.string().optional().allow("", null),
}).or("email", "phone"); // At least one of email or phone must be provided

exports.verifySchema = Joi.object({
  userId: Joi.number().required(),
  otp: Joi.string().length(6).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().min(7),
}).or("email", "phone");
