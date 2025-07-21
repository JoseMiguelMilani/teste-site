import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  ChefHat,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
} from "lucide-react";
import { FinancialRecord } from "@shared/api";

export default function Financas() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | "entrada" | "saida">("todos");
  const [dateFilter, setDateFilter] = useState<"semana" | "mes" | "ano">("mes");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    orderCount: 0,
  });

  useEffect(() => {
    fetchFinances();
  }, [dateFilter]);

  const fetchFinances = async () => {
    try {
      const response = await fetch(`/api/finances?period=${dateFilter}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
        setStats({
          totalRevenue: data.totalRevenue,
          totalExpenses: data.totalExpenses,
          netProfit: data.totalRevenue - data.totalExpenses,
          orderCount: data.records.filter((r) => r.type === "entrada").length,
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
    const csvContent = [
      "Data,Tipo,Descrição,Valor",
      ...filteredRecords.map((record) =>
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

  const filteredRecords = records.filter((record) =>
    filter === "todos" ? true : record.type === filter,
  );

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
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-brown flex items-center">
                  <DollarSign className="h-6 w-6 text-orange mr-2" />
                  Finanças
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <ChefHat className="h-4 w-4 text-orange" />
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

        {/* Transactions */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-brown">
                  Histórico de Transações
                </CardTitle>
                <CardDescription>
                  Todas as entradas e saídas do período selecionado
                </CardDescription>
              </div>
              <Select
                value={filter}
                onValueChange={(value) =>
                  setFilter(value as "todos" | "entrada" | "saida")
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-orange/50 mx-auto mb-4" />
                <p className="text-brown-light">
                  Nenhuma transação encontrada para este período.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
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
                            record.type === "entrada" ? "default" : "secondary"
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
      </div>
    </div>
  );
}
