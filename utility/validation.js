exports.validateSignup = (email, phone) => {
  if (!email && !phone) {
    return "Email or phone is required.";
  }
  return null;
};

exports.validateQuantity = (quantity) => {
  if (!quantity || quantity <= 0) {
    return "Quantity must be greater than 0.";
  }
  return null;
};
