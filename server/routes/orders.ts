import { RequestHandler } from "express";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  Order,
  OrderStatus,
  FinancialRecord,
  MarmitaSize,
  AdminLoginRequest,
  AdminLoginResponse,
} from "@shared/api";
import { availableDrinks } from "./admin-config";

// In-memory storage (in production, you'd use a database)
let orders: Order[] = [];
let financialRecords: FinancialRecord[] = [];

// Admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "123456",
};

// Marmita prices
const marmitaPrices = {
  pequena: 12.0,
  media: 15.0,
  grande: 18.0,
};

// Drink prices
const drinkPrices = {
  "coca-lata": 4.0,
  "guarana-lata": 4.0,
  "sprite-lata": 4.0,
};

// Admin login
export const adminLogin: RequestHandler = (req, res) => {
  try {
    // Validate request body exists
    if (!req.body) {
      res.status(400).json({
        success: false,
        message: "Request body is missing.",
      });
      return;
    }

    const { username, password } = req.body as AdminLoginRequest;

    // Validate required fields
    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
      return;
    }

    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const token = `admin_token_${Date.now()}`;
      const response: AdminLoginResponse = {
        success: true,
        token,
        message: "Login realizado com sucesso!",
      };
      res.status(200).json(response);
    } else {
      const response: AdminLoginResponse = {
        success: false,
        message: "Usuário ou senha incorretos.",
      };
      res.status(401).json(response);
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

// Create a new order
export const createOrder: RequestHandler = (req, res) => {
  try {
    const orderData = req.body as CreateOrderRequest;

    // Validate required fields
    if (
      !orderData.item ||
      !orderData.address ||
      !orderData.customerName ||
      !orderData.customerPhone ||
      !orderData.paymentMethod
    ) {
      res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios.",
      });
      return;
    }

    // Get unit price based on size
    const unitPrice = marmitaPrices[orderData.item.size];

    // Calculate drinks total - need to look up drink by ID from available drinks
    const drinksTotal =
      orderData.item.options.drinks?.reduce((total, drink) => {
        // Find the actual drink info by ID
        const drinkInfo = availableDrinks.find((d) => d.id === drink.type);
        const drinkPrice = drinkInfo?.price || 0;
        return total + drinkPrice * drink.quantity;
      }, 0) || 0;

    const marmitaTotal =
      (unitPrice || 0) * (orderData.item.options.quantidade || 1);
    const totalPrice = marmitaTotal + drinksTotal;

    // Create order item with calculated prices
    const orderItem = {
      ...orderData.item,
      unitPrice,
      drinksTotal,
      totalPrice,
    };

    // Create new order
    const newOrder: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      item: orderItem,
      address: orderData.address,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      total: totalPrice,
      status: "pendente",
      paymentMethod: orderData.paymentMethod,
      delivered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to orders array
    orders.push(newOrder);

    // Create description with extras
    const extras = [];
    if (orderData.item.options.salada) extras.push("Salada");
    if (orderData.item.options.torresmo) extras.push("Torresmo");
    if (orderData.item.options.talheres) extras.push("Talheres");
    const extrasText = extras.length > 0 ? ` (${extras.join(", ")})` : "";

    // Create financial record for the revenue
    const financialRecord: FinancialRecord = {
      id: `finance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: newOrder.id,
      amount: totalPrice,
      type: "entrada",
      description: `Marmita ${orderData.item.size}${extrasText} - ${orderData.customerName}`,
      date: new Date().toISOString(),
    };

    financialRecords.push(financialRecord);

    const response: CreateOrderResponse = {
      order: newOrder,
      success: true,
      message: "Pedido criado com sucesso!",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

// Get all orders
export const getOrders: RequestHandler = (req, res) => {
  try {
    const response: GetOrdersResponse = {
      orders: orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar pedidos.",
    });
  }
};

// Update order status or delivery status
export const updateOrderStatus: RequestHandler = (req, res) => {
  try {
    const { orderId, status, delivered } = req.body as UpdateOrderStatusRequest;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "ID do pedido é obrigatório.",
      });
      return;
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
      return;
    }

    // Update order properties
    const updatedOrder = {
      ...orders[orderIndex],
      updatedAt: new Date().toISOString(),
    };

    if (status !== undefined) {
      updatedOrder.status = status;
    }

    if (delivered !== undefined) {
      updatedOrder.delivered = delivered;
      // If marked as delivered, also update status
      if (delivered) {
        updatedOrder.status = "entregue";
      }
    }

    orders[orderIndex] = updatedOrder;

    const response: UpdateOrderStatusResponse = {
      order: updatedOrder,
      success: true,
      message: `Pedido atualizado com sucesso.`,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar pedido.",
    });
  }
};

// Export financial records for the finances page
export { financialRecords };
