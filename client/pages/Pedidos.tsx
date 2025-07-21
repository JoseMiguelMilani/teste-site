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
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { Order, OrderStatus } from "@shared/api";

export default function Pedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch("/api/orders/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await response.json();
      if (data.success) {
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status } : order,
          ),
        );
        toast({
          title: "Status atualizado",
          description: `Pedido #${orderId.slice(-6)} foi atualizado para ${getStatusLabel(status)}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "preparando":
        return "Preparando";
      case "pronto":
        return "Pronto";
      case "entregue":
        return "Entregue";
      case "cancelado":
        return "Cancelado";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4" />;
      case "preparando":
        return <Package className="h-4 w-4" />;
      case "pronto":
        return <CheckCircle className="h-4 w-4" />;
      case "entregue":
        return <Truck className="h-4 w-4" />;
      case "cancelado":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case "pendente":
        return "secondary";
      case "preparando":
        return "default";
      case "pronto":
        return "default";
      case "entregue":
        return "default";
      case "cancelado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredOrders = orders.filter((order) =>
    filter === "todos" ? true : order.status === filter,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-orange mx-auto mb-4 animate-pulse" />
          <p className="text-brown-light">Carregando pedidos...</p>
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
                  <Package className="h-6 w-6 text-orange mr-2" />
                  Gerenciar Pedidos
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select
                value={filter}
                onValueChange={(value) =>
                  setFilter(value as OrderStatus | "todos")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Pedidos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="preparando">Preparando</SelectItem>
                  <SelectItem value="pronto">Prontos</SelectItem>
                  <SelectItem value="entregue">Entregues</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Orders List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-orange/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brown mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-brown-light">
              {filter === "todos"
                ? "Ainda não há pedidos para exibir."
                : `Não há pedidos com status "${getStatusLabel(filter as OrderStatus)}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((order) => (
                <Card
                  key={order.id}
                  className="bg-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-brown">
                          Pedido #{order.id.slice(-6)}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={getStatusVariant(order.status)}
                          className="flex items-center space-x-1"
                        >
                          {getStatusIcon(order.status)}
                          <span>{getStatusLabel(order.status)}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-semibold text-brown mb-2">
                          Cliente
                        </h4>
                        <p className="text-sm text-brown-light">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-brown-light">
                          {order.customerPhone}
                        </p>
                      </div>

                      {/* Address */}
                      <div>
                        <h4 className="font-semibold text-brown mb-2">
                          Endereço
                        </h4>
                        <p className="text-sm text-brown-light">
                          {order.address.street}, {order.address.number}
                          {order.address.complement &&
                            `, ${order.address.complement}`}
                        </p>
                        <p className="text-sm text-brown-light">
                          {order.address.neighborhood}, {order.address.city}
                        </p>
                        <p className="text-sm text-brown-light">
                          CEP: {order.address.zipCode}
                        </p>
                      </div>

                      {/* Payment */}
                      <div>
                        <h4 className="font-semibold text-brown mb-2">
                          Pagamento
                        </h4>
                        <p className="text-sm text-brown-light">
                          {order.paymentMethod}
                        </p>
                        <p className="text-lg font-bold text-orange">
                          R$ {order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-brown mb-3">Itens</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-cream/30 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-brown">
                                {item.productName}
                              </span>
                              <span className="text-sm text-brown-light ml-2">
                                ({item.size})
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-brown-light">
                                {item.quantity}x R$ {item.price.toFixed(2)}
                              </p>
                              <p className="font-medium text-brown">
                                R$ {(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Actions */}
                    {order.status !== "entregue" &&
                      order.status !== "cancelado" && (
                        <div className="mt-6 pt-4 border-t">
                          <h4 className="font-semibold text-brown mb-3">
                            Atualizar Status
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {order.status === "pendente" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatus(order.id, "preparando")
                                  }
                                  className="bg-orange hover:bg-orange-dark"
                                >
                                  Iniciar Preparo
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    updateOrderStatus(order.id, "cancelado")
                                  }
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}
                            {order.status === "preparando" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus(order.id, "pronto")
                                }
                                className="bg-orange hover:bg-orange-dark"
                              >
                                Marcar como Pronto
                              </Button>
                            )}
                            {order.status === "pronto" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus(order.id, "entregue")
                                }
                                className="bg-orange hover:bg-orange-dark"
                              >
                                Marcar como Entregue
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
