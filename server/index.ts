import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  adminLogin,
} from "./routes/orders";
import { getFinances, addExpense, getExpenses } from "./routes/finances";
import {
  getIngredients,
  createIngredient,
  toggleIngredientAvailability,
  getHouseSpecials,
  createHouseSpecial,
  toggleHouseSpecialAvailability,
  getAvailableDrinks,
  createDrink,
  toggleDrinkAvailability,
} from "./routes/admin-config";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Sabor & Cia API!" });
  });

  app.get("/api/demo", handleDemo);

  // Admin API
  app.post("/api/admin/login", adminLogin);

  // Orders API
  app.post("/api/orders", createOrder);
  app.get("/api/orders", getOrders);
  app.put("/api/orders/status", updateOrderStatus);

  // Finances API
  app.get("/api/finances", getFinances);
  app.post("/api/finances/expense", addExpense);
  app.get("/api/finances/expenses", getExpenses);

  // Admin Configuration API
  // Ingredients
  app.get("/api/admin/ingredients", getIngredients);
  app.post("/api/admin/ingredients", createIngredient);
  app.patch("/api/admin/ingredients/:id/toggle", toggleIngredientAvailability);

  // House Specials
  app.get("/api/admin/house-specials", getHouseSpecials);
  app.post("/api/admin/house-specials", createHouseSpecial);
  app.patch(
    "/api/admin/house-specials/:id/toggle",
    toggleHouseSpecialAvailability,
  );

  // Drinks
  app.get("/api/admin/drinks", getAvailableDrinks);
  app.post("/api/admin/drinks", createDrink);
  app.patch("/api/admin/drinks/:id/toggle", toggleDrinkAvailability);

  return app;
}
