import { RequestHandler } from "express";
import {
  GetFinancesResponse,
  FinancialRecord,
  AddExpenseRequest,
  AddExpenseResponse,
  Expense,
} from "@shared/api";
import { financialRecords } from "./orders";

// In-memory storage for expenses
let expenses: Expense[] = [];

// Get financial data with chart analytics
export const getFinances: RequestHandler = (req, res) => {
  try {
    const period = (req.query.period as string) || "mes";

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "semana":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "mes":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "ano":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Filter records by date range
    const filteredRecords = financialRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= now;
    });

    // Calculate totals
    const totalRevenue = filteredRecords
      .filter((record) => record.type === "entrada")
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = filteredRecords
      .filter((record) => record.type === "saida")
      .reduce((sum, record) => sum + record.amount, 0);

    // Generate chart data
    const chartData = generateChartData(filteredRecords, startDate, now);

    const response: GetFinancesResponse = {
      records: filteredRecords.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
      totalRevenue,
      totalExpenses,
      chartData,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching finances:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar dados financeiros.",
      records: [],
      totalRevenue: 0,
      totalExpenses: 0,
      chartData: {
        daily: [],
        monthly: [],
        paymentMethods: [],
        sizes: [],
      },
    });
  }
};

// Generate chart data for analytics
function generateChartData(
  records: FinancialRecord[],
  startDate: Date,
  endDate: Date,
) {
  // Daily revenue chart (last 7 days)
  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split("T")[0];

    const dayRecords = records.filter((record) => {
      const recordDate = new Date(record.date).toISOString().split("T")[0];
      return recordDate === dateString && record.type === "entrada";
    });

    daily.push({
      date: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue: dayRecords.reduce((sum, record) => sum + record.amount, 0),
      orders: dayRecords.length,
    });
  }

  // Monthly revenue chart (last 12 months)
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate >= monthStart &&
        recordDate <= monthEnd &&
        record.type === "entrada"
      );
    });

    monthly.push({
      month: date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
      revenue: monthRecords.reduce((sum, record) => sum + record.amount, 0),
      orders: monthRecords.length,
    });
  }

  // Payment methods chart
  const paymentMethodsMap = new Map<
    string,
    { amount: number; count: number }
  >();
  records
    .filter((record) => record.type === "entrada")
    .forEach((record) => {
      // Extract payment method from description or use a default
      let method = "Outros";
      if (record.description.includes("PIX")) method = "PIX";
      else if (record.description.includes("Cartão")) method = "Cartão";
      else if (record.description.includes("Dinheiro")) method = "Dinheiro";

      const current = paymentMethodsMap.get(method) || { amount: 0, count: 0 };
      paymentMethodsMap.set(method, {
        amount: current.amount + record.amount,
        count: current.count + 1,
      });
    });

  const paymentMethods = Array.from(paymentMethodsMap.entries()).map(
    ([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
    }),
  );

  // Sizes chart
  const sizesMap = new Map<string, { count: number; revenue: number }>();
  records
    .filter((record) => record.type === "entrada")
    .forEach((record) => {
      // Extract size from description
      let size = "Outros";
      if (record.description.includes("pequena")) size = "Pequena";
      else if (record.description.includes("media")) size = "Média";
      else if (record.description.includes("grande")) size = "Grande";

      const current = sizesMap.get(size) || { count: 0, revenue: 0 };
      sizesMap.set(size, {
        count: current.count + 1,
        revenue: current.revenue + record.amount,
      });
    });

  const sizes = Array.from(sizesMap.entries()).map(([size, data]) => ({
    size,
    count: data.count,
    revenue: data.revenue,
  }));

  return {
    daily,
    monthly,
    paymentMethods,
    sizes,
  };
}

// Add expense with installment support
export const addExpense: RequestHandler = (req, res) => {
  try {
    const { description, amount, installments } = req.body as AddExpenseRequest;

    // Validate required fields
    if (!description || !amount || !installments) {
      res.status(400).json({
        success: false,
        message: "Descrição, valor e parcelas são obrigatórios.",
      });
      return;
    }

    if (amount <= 0 || installments <= 0) {
      res.status(400).json({
        success: false,
        message: "Valor e parcelas devem ser maiores que zero.",
      });
      return;
    }

    const monthlyAmount = amount / installments;
    const startDate = new Date();
    const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create expense record
    const expense: Expense = {
      id: expenseId,
      description,
      amount,
      installments,
      monthlyAmount,
      startDate: startDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    expenses.push(expense);

    // Create financial records for each installment
    for (let i = 0; i < installments; i++) {
      const installmentDate = new Date(startDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      const financialRecord: FinancialRecord = {
        id: `finance_expense_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: expenseId,
        amount: monthlyAmount,
        type: "saida",
        description:
          installments > 1
            ? `${description} (${i + 1}/${installments})`
            : description,
        date: installmentDate.toISOString(),
      };

      financialRecords.push(financialRecord);
    }

    const response: AddExpenseResponse = {
      expense,
      success: true,
      message: `Despesa de R$ ${amount.toFixed(2)} adicionada com sucesso! ${installments > 1 ? `Dividida em ${installments} parcelas de R$ ${monthlyAmount.toFixed(2)}.` : ""}`,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao adicionar despesa.",
    });
  }
};

// Get all expenses
export const getExpenses: RequestHandler = (req, res) => {
  try {
    res.json({
      expenses: expenses.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      success: true,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar despesas.",
      expenses: [],
    });
  }
};
