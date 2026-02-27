const express = require("express");
const router = express.Router();

const { getFoods, addFood, updateFood } = require("../controller/foodCont");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// GET /api/foods - Public: browse available food items
router.get("/", getFoods);

// POST /api/foods - Admin only: add a new food item
router.post("/", authenticate, authorizeRoles("admin"), addFood);

// PUT /api/foods/:id - Admin only: update food item (price, availability, etc.)
router.put("/:id", authenticate, authorizeRoles("admin"), updateFood);

module.exports = router;
