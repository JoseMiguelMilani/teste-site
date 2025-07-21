import { RequestHandler } from "express";
import {
  Ingredient,
  HouseSpecial,
  AvailableDrink,
  CreateIngredientRequest,
  CreateIngredientResponse,
  GetIngredientsResponse,
  CreateHouseSpecialRequest,
  CreateHouseSpecialResponse,
  GetHouseSpecialsResponse,
  CreateDrinkRequest,
  CreateDrinkResponse,
  GetAvailableDrinksResponse,
  DrinkType,
} from "@shared/api";

// In-memory storage (in production, use a database)
let ingredients: Ingredient[] = [
  {
    id: "ing_1",
    name: "Arroz Branco",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ing_2",
    name: "Feijão Carioca",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ing_3",
    name: "Carne Bovina",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ing_4",
    name: "Frango Grelhado",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ing_5",
    name: "Salada Verde",
    available: true,
    createdAt: new Date().toISOString(),
  },
];

let houseSpecials: HouseSpecial[] = [
  {
    id: "house_1",
    name: "Marmita Tradicional",
    description: "A clássica combinação que todo mundo ama",
    ingredients: ["ing_1", "ing_2", "ing_3", "ing_5"],
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "house_2",
    name: "Marmita Light",
    description: "Opção mais leve com frango e salada",
    ingredients: ["ing_1", "ing_2", "ing_4", "ing_5"],
    available: true,
    createdAt: new Date().toISOString(),
  },
];

let availableDrinks: AvailableDrink[] = [
  {
    id: "drink_1",
    type: "coca-lata",
    name: "Coca-Cola Lata 350ml",
    price: 4.0,
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "drink_2",
    type: "guarana-lata",
    name: "Guaraná Antarctica Lata 350ml",
    price: 4.0,
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "drink_3",
    type: "sprite-lata",
    name: "Sprite Lata 350ml",
    price: 4.0,
    available: true,
    createdAt: new Date().toISOString(),
  },
];

// INGREDIENTS ENDPOINTS

// Get all ingredients
export const getIngredients: RequestHandler = (req, res) => {
  try {
    const response: GetIngredientsResponse = {
      ingredients: ingredients.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar ingredientes.",
      ingredients: [],
    });
  }
};

// Create ingredient
export const createIngredient: RequestHandler = (req, res) => {
  try {
    const { name } = req.body as CreateIngredientRequest;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Nome do ingrediente é obrigatório.",
      });
      return;
    }

    // Check if ingredient already exists
    const existingIngredient = ingredients.find(
      (ing) => ing.name.toLowerCase() === name.trim().toLowerCase(),
    );

    if (existingIngredient) {
      res.status(400).json({
        success: false,
        message: "Ingrediente já existe.",
      });
      return;
    }

    const newIngredient: Ingredient = {
      id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      available: true,
      createdAt: new Date().toISOString(),
    };

    ingredients.push(newIngredient);

    const response: CreateIngredientResponse = {
      ingredient: newIngredient,
      success: true,
      message: "Ingrediente criado com sucesso!",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating ingredient:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

// Toggle ingredient availability
export const toggleIngredientAvailability: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const ingredientIndex = ingredients.findIndex((ing) => ing.id === id);
    if (ingredientIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Ingrediente não encontrado.",
      });
      return;
    }

    ingredients[ingredientIndex] = {
      ...ingredients[ingredientIndex],
      available: available,
    };

    res.json({
      success: true,
      message: "Disponibilidade atualizada com sucesso.",
      ingredient: ingredients[ingredientIndex],
    });
  } catch (error) {
    console.error("Error toggling ingredient availability:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

// HOUSE SPECIALS ENDPOINTS

// Get all house specials
export const getHouseSpecials: RequestHandler = (req, res) => {
  try {
    const response: GetHouseSpecialsResponse = {
      houseSpecials: houseSpecials.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching house specials:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar modas da casa.",
      houseSpecials: [],
    });
  }
};

// Create house special
export const createHouseSpecial: RequestHandler = (req, res) => {
  try {
    const {
      name,
      description,
      ingredients: selectedIngredients,
    } = req.body as CreateHouseSpecialRequest;

    if (
      !name ||
      !name.trim() ||
      !description ||
      !description.trim() ||
      !selectedIngredients ||
      selectedIngredients.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios.",
      });
      return;
    }

    // Validate that all ingredients exist
    const invalidIngredients = selectedIngredients.filter(
      (ingId) => !ingredients.find((ing) => ing.id === ingId),
    );

    if (invalidIngredients.length > 0) {
      res.status(400).json({
        success: false,
        message: "Alguns ingredientes selecionados não existem.",
      });
      return;
    }

    const newHouseSpecial: HouseSpecial = {
      id: `house_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description.trim(),
      ingredients: selectedIngredients,
      available: true,
      createdAt: new Date().toISOString(),
    };

    houseSpecials.push(newHouseSpecial);

    const response: CreateHouseSpecialResponse = {
      houseSpecial: newHouseSpecial,
      success: true,
      message: "Moda da casa criada com sucesso!",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating house special:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

// Toggle house special availability
export const toggleHouseSpecialAvailability: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const houseSpecialIndex = houseSpecials.findIndex(
      (special) => special.id === id,
    );
    if (houseSpecialIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Moda da casa não encontrada.",
      });
      return;
    }

    houseSpecials[houseSpecialIndex] = {
      ...houseSpecials[houseSpecialIndex],
      available: available,
    };

    res.json({
      success: true,
      message: "Disponibilidade atualizada com sucesso.",
      houseSpecial: houseSpecials[houseSpecialIndex],
    });
  } catch (error) {
    console.error("Error toggling house special availability:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

// DRINKS ENDPOINTS

// Get all available drinks
export const getAvailableDrinks: RequestHandler = (req, res) => {
  try {
    const response: GetAvailableDrinksResponse = {
      drinks: availableDrinks.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching drinks:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar bebidas.",
      drinks: [],
    });
  }
};

// Create drink
export const createDrink: RequestHandler = (req, res) => {
  try {
    const { type, name, price } = req.body as CreateDrinkRequest;

    if (!type || !name || !name.trim() || !price || price <= 0) {
      res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios e preço deve ser positivo.",
      });
      return;
    }

    const newDrink: AvailableDrink = {
      id: `drink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: name.trim(),
      price,
      available: true,
      createdAt: new Date().toISOString(),
    };

    availableDrinks.push(newDrink);

    const response: CreateDrinkResponse = {
      drink: newDrink,
      success: true,
      message: "Bebida criada com sucesso!",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating drink:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

// Toggle drink availability
export const toggleDrinkAvailability: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const drinkIndex = availableDrinks.findIndex((drink) => drink.id === id);
    if (drinkIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Bebida não encontrada.",
      });
      return;
    }

    availableDrinks[drinkIndex] = {
      ...availableDrinks[drinkIndex],
      available: available,
    };

    res.json({
      success: true,
      message: "Disponibilidade atualizada com sucesso.",
      drink: availableDrinks[drinkIndex],
    });
  } catch (error) {
    console.error("Error toggling drink availability:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

// Export data for use in orders
export { ingredients, houseSpecials, availableDrinks };
