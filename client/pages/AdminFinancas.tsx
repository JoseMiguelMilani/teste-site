import { useState, useEffect } from "react";

// Suppress recharts defaultProps warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes && args[0].includes("defaultProps will be removed")) {
    return;
  }
  originalConsoleWarn(...args);
};
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChefHat,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Package,
  Plus,
  Receipt,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdmin } from "@/contexts/AdminContext";
import {
  FinancialRecord,
  GetFinancesResponse,
  AddExpenseRequest,
} from "@shared/api";

export default function AdminFinancas() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdmin();
  const [data, setData] = useState<GetFinancesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<"semana" | "mes" | "ano">("mes");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    orderCount: 0,
  });

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    installments: "1",
  });
  const [addingExpense, setAddingExpense] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchFinances();
  }, [isAdmin, navigate, dateFilter]);

  const fetchFinances = async () => {
    try {
      const response = await fetch(`/api/finances?period=${dateFilter}`);
      const responseData = await response.json();
      if (responseData.success) {
        setData(responseData);
        setStats({
          totalRevenue: responseData.totalRevenue,
          totalExpenses: responseData.totalExpenses,
          netProfit: responseData.totalRevenue - responseData.totalExpenses,
          orderCount: responseData.records.filter((r) => r.type === "entrada")
            .length,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;

    const csvContent = [
      "Data,Tipo,Descrição,Valor",
      ...data.records.map((record) =>
        [
          new Date(record.date).toLocaleDateString("pt-BR"),
          record.type === "entrada" ? "Entrada" : "Saída",
          record.description,
          record.amount.toFixed(2),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financas-${dateFilter}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha descrição e valor da despesa.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(expenseForm.amount);
    const installments = parseInt(expenseForm.installments);

    if (amount <= 0 || installments <= 0) {
      toast({
        title: "Erro",
        description: "Valor e parcelas devem ser maiores que zero.",
        variant: "destructive",
      });
      return;
    }

    setAddingExpense(true);

    try {
      const expenseData: AddExpenseRequest = {
        description: expenseForm.description,
        amount,
        installments,
      };

      const response = await fetch("/api/finances/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Despesa adicionada!",
          description: `Despesa de R$ ${amount.toFixed(2)} foi registrada.`,
        });
        setShowAddExpense(false);
        setExpenseForm({ description: "", amount: "", installments: "1" });
        // Refresh data
        fetchFinances();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar despesa",
        description: "Não foi possível registrar a despesa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setAddingExpense(false);
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "semana":
        return "Esta Semana";
      case "mes":
        return "Este Mês";
      case "ano":
        return "Este Ano";
      default:
        return "Período";
    }
  };

  // Chart colors
  const chartColors = {
    primary: "#f97316", // orange
    secondary: "#fed7aa", // orange-light
    success: "#22c55e", // green
    danger: "#ef4444", // red
    muted: "#6b7280", // gray
  };

  const pieColors = ["#f97316", "#fed7aa", "#fdba74", "#fb923c"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-orange mx-auto mb-4 animate-pulse" />
          <p className="text-brown-light">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-brown flex items-center">
                  <DollarSign className="h-6 w-6 text-orange mr-2" />
                  Dashboard Financeiro
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/pedidos")}
                className="border-orange text-orange hover:bg-orange/10"
              >
                Pedidos
              </Button>
              <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Despesa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Despesa</DialogTitle>
                    <DialogDescription>
                      Registre uma nova despesa do restaurante.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">No que foi gasto</Label>
                      <Input
                        id="description"
                        value={expenseForm.description}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Ex: Ingredientes, aluguel, equipamentos..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Quantia gasta (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={expenseForm.amount}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            amount: e.target.value,
                          })
                        }
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="installments">
                        Em quantas vezes foi pago
                      </Label>
                      <Input
                        id="installments"
                        type="number"
                        min="1"
                        value={expenseForm.installments}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            installments: e.target.value,
                          })
                        }
                        placeholder="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se maior que 1, o valor será dividido entre os meses
                      </p>
                    </div>
                    <Button
                      onClick={handleAddExpense}
                      disabled={addingExpense}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      {addingExpense ? "Adicionando..." : "Adicionar Despesa"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Select
                value={dateFilter}
                onValueChange={(value) =>
                  setDateFilter(value as "semana" | "mes" | "ano")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="ano">Este Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                className="border-orange text-orange hover:bg-orange/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-brown-light">
                Receita Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-brown-light">
                {getPeriodLabel(dateFilter)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-brown-light">
                Gastos Totais
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {stats.totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-brown-light">
                {getPeriodLabel(dateFilter)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-brown-light">
                Lucro Líquido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-orange" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                R$ {stats.netProfit.toFixed(2)}
              </div>
              <p className="text-xs text-brown-light">
                {getPeriodLabel(dateFilter)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-brown-light">
                Total de Pedidos
              </CardTitle>
              <Package className="h-4 w-4 text-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange">
                {stats.orderCount}
              </div>
              <p className="text-xs text-brown-light">
                {getPeriodLabel(dateFilter)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Daily Revenue Chart */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-brown">Receita Diária</CardTitle>
                <CardDescription>Últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.chartData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `R$ ${value.toFixed(2)}`,
                        "Receita",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={chartColors.primary}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Revenue Chart */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-brown">Receita Mensal</CardTitle>
                <CardDescription>Últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.chartData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `R$ ${value.toFixed(2)}`,
                        "Receita",
                      ]}
                    />
                    <Bar dataKey="revenue" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods Chart */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-brown">
                  Métodos de Pagamento
                </CardTitle>
                <CardDescription>
                  Distribuição por forma de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.chartData.paymentMethods}
                      dataKey="amount"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) =>
                        `${entry.method}: R$ ${entry.amount.toFixed(2)}`
                      }
                    >
                      {data.chartData.paymentMethods.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `R$ ${value.toFixed(2)}`,
                        "Total",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sizes Chart */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-brown">
                  Tamanhos Mais Vendidos
                </CardTitle>
                <CardDescription>Vendas por tamanho de marmita</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.chartData.sizes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="size" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "count"
                          ? `${value} vendas`
                          : `R$ ${value.toFixed(2)}`,
                        name === "count" ? "Quantidade" : "Receita",
                      ]}
                    />
                    <Bar dataKey="count" fill={chartColors.secondary} />
                    <Bar dataKey="revenue" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Transactions */}
        {data && (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-brown">Transações Recentes</CardTitle>
              <CardDescription>
                Últimas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.records.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-orange/50 mx-auto mb-4" />
                  <p className="text-brown-light">
                    Nenhuma transação encontrada para este período.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {data.records
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .slice(0, 20)
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-cream/30 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              record.type === "entrada"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {record.type === "entrada" ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-brown">
                              {record.description}
                            </p>
                            <p className="text-sm text-brown-light">
                              {new Date(record.date).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              record.type === "entrada"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {record.type === "entrada" ? "+" : "-"}R${" "}
                            {record.amount.toFixed(2)}
                          </p>
                          <Badge
                            variant={
                              record.type === "entrada"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              record.type === "entrada"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {record.type === "entrada" ? "Entrada" : "Saída"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
