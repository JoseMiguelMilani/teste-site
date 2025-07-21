/**
 * Shared types for the marmita restaurant app
 */

// Marmita sizes
export type MarmitaSize = "pequena" | "media" | "grande";

// Order status
export type OrderStatus =
  | "pendente"
  | "preparando"
  | "pronta"
  | "entregue"
  | "cancelado";

// Drink types
export type DrinkType = "coca-lata" | "guarana-lata" | "sprite-lata";

// Drink option
export interface DrinkOption {
  type: DrinkType;
  quantity: number;
}

// Ordering type
export type OrderingType = "moda-da-casa" | "personalizada";

// Ingredient interface
export interface Ingredient {
  id: string;
  name: string;
  available: boolean;
  createdAt: string;
}

// House special interface
export interface HouseSpecial {
  id: string;
  name: string;
  description: string;
  ingredients: string[]; // ingredient IDs
  available: boolean;
  createdAt: string;
}

// Marmita options
export interface MarmitaOptions {
  orderingType: OrderingType;
  houseSpecialId?: string; // if ordering type is "moda-da-casa"
  selectedIngredients?: string[]; // if ordering type is "personalizada"
  salada: boolean;
  torresmo: boolean;
  talheres: boolean;
  quantidade: number;
  wantsDrinks: boolean;
  drinks: DrinkOption[];
}

// Marmita pricing
export interface MarmitaPricing {
  pequena: number;
  media: number;
  grande: number;
}

// Order item interface
export interface OrderItem {
  size: MarmitaSize;
  options: MarmitaOptions;
  unitPrice: number;
  drinksTotal: number;
  totalPrice: number;
}

// Address interface
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
}

// Order interface
export interface Order {
  id: string;
  item: OrderItem;
  address: Address;
  customerName: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  delivered: boolean;
  createdAt: string;
  updatedAt: string;
}

// Financial record interface
export interface FinancialRecord {
  id: string;
  orderId: string;
  amount: number;
  type: "entrada" | "saida";
  description: string;
  date: string;
}

// Admin auth interface
export interface AdminAuth {
  isAuthenticated: boolean;
  token?: string;
}

// API Response types
export interface DemoResponse {
  message: string;
}

export interface CreateOrderRequest {
  item: Omit<OrderItem, "unitPrice" | "totalPrice">;
  address: Address;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
}

export interface CreateOrderResponse {
  order: Order;
  success: boolean;
  message: string;
}

export interface GetOrdersResponse {
  orders: Order[];
  success: boolean;
}

export interface GetFinancesResponse {
  records: FinancialRecord[];
  totalRevenue: number;
  totalExpenses: number;
  chartData: {
    daily: Array<{ date: string; revenue: number; orders: number }>;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
    paymentMethods: Array<{ method: string; amount: number; count: number }>;
    sizes: Array<{ size: string; count: number; revenue: number }>;
  };
  success: boolean;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status?: OrderStatus;
  delivered?: boolean;
}

export interface UpdateOrderStatusResponse {
  order: Order;
  success: boolean;
  message: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  message: string;
}

export interface MarmitaPrices {
  pequena: number;
  media: number;
  grande: number;
}

export interface DrinkPrices {
  "coca-lata": number;
  "guarana-lata": number;
  "sprite-lata": number;
}

// Expense interface
export interface Expense {
  id: string;
  description: string;
  amount: number;
  installments: number;
  monthlyAmount: number;
  startDate: string;
  createdAt: string;
}

// Add expense request
export interface AddExpenseRequest {
  description: string;
  amount: number;
  installments: number;
}

// Add expense response
export interface AddExpenseResponse {
  expense: Expense;
  success: boolean;
  message: string;
}

// Admin ingredient management
export interface CreateIngredientRequest {
  name: string;
}

export interface CreateIngredientResponse {
  ingredient: Ingredient;
  success: boolean;
  message: string;
}

export interface GetIngredientsResponse {
  ingredients: Ingredient[];
  success: boolean;
}

// Admin house special management
export interface CreateHouseSpecialRequest {
  name: string;
  description: string;
  ingredients: string[]; // ingredient IDs
}

export interface CreateHouseSpecialResponse {
  houseSpecial: HouseSpecial;
  success: boolean;
  message: string;
}

export interface GetHouseSpecialsResponse {
  houseSpecials: HouseSpecial[];
  success: boolean;
}

// Admin drink management
export interface AvailableDrink {
  id: string;
  type: DrinkType;
  name: string;
  price: number;
  available: boolean;
  createdAt: string;
}

export interface CreateDrinkRequest {
  type: DrinkType;
  name: string;
  price: number;
}

export interface CreateDrinkResponse {
  drink: AvailableDrink;
  success: boolean;
  message: string;
}

export interface GetAvailableDrinksResponse {
  drinks: AvailableDrink[];
  success: boolean;
}
