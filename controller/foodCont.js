const foodModel = require("../model/food");
const { successResponse, errorResponse } = require("../utility/resp");

// GET /api/foods - Public: list all available foods
exports.getFoods = (req, res) => {
  foodModel.getAllFoods((err, foods) => {
    if (err) return errorResponse(res, err.message, 500);
    return successResponse(res, foods, "Foods retrieved successfully.");
  });
};

// POST /api/foods - Admin: add a new food item
exports.addFood = (req, res) => {
  const { name, description, price, image_url } = req.body;

  if (!name || !price) return errorResponse(res, "Name and price are required.");
  if (price < 0) return errorResponse(res, "Price cannot be negative.");

  foodModel.createFood({ name, description, price, image_url }, (err, foodId) => {
    if (err) return errorResponse(res, err.message, 500);
    return successResponse(res, { foodId }, "Food item added successfully.", 201);
  });
};

// PUT /api/foods/:id - Admin: update food item
exports.updateFood = (req, res) => {
  const { id } = req.params;
  const { name, description, price, is_available, image_url } = req.body;

  foodModel.updateFood(id, { name, description, price, is_available, image_url }, (err) => {
    if (err) return errorResponse(res, err.message, 500);
    return successResponse(res, {}, "Food item updated successfully.");
  });
};
