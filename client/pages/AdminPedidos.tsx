import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Eye,
  Phone,
  MapPin,
  Utensils,
  Salad,
  Ham,
  UtensilsCrossed,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { Order, OrderStatus } from "@shared/api";

export default function AdminPedidos() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchOrders();
  }, [isAdmin, navigate]);

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

  const toggleDeliveryStatus = async (orderId: string, delivered: boolean) => {
    try {
      const response = await fetch("/api/orders/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, delivered }),
      });

      const data = await response.json();
      if (data.success) {
        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  delivered,
                  status: delivered ? "entregue" : order.status,
                }
              : order,
          ),
        );
        toast({
          title: "Status atualizado",
          description: `Pedido #${orderId.slice(-6)} marcado como ${delivered ? "entregue" : "não entregue"}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de entrega.",
        variant: "destructive",
      });
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
          description: `Pedido #${orderId.slice(-6)} atualizado para ${getStatusLabel(status)}.`,
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
      case "pronta":
        return "Pronta";
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
      case "pronta":
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
      case "pronta":
        return "default";
      case "entregue":
        return "default";
      case "cancelado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case "pequena":
        return "Pequena";
      case "media":
        return "Média";
      case "grande":
        return "Grande";
      default:
        return size;
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-brown flex items-center">
                  <Package className="h-6 w-6 text-orange mr-2" />
                  Gerenciar Pedidos
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/financas")}
                className="border-orange text-orange hover:bg-orange/10"
              >
                Finanças
              </Button>
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
                  <SelectItem value="pronta">Prontas</SelectItem>
                  <SelectItem value="entregue">Entregues</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((order) => (
                <Card
                  key={order.id}
                  className={`bg-white shadow-lg hover:shadow-xl transition-shadow ${
                    order.delivered ? "ring-2 ring-green-200" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-brown text-lg">
                          Pedido #{order.id.slice(-6)}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={getStatusVariant(order.status)}
                          className="flex items-center space-x-1"
                        >
                          {getStatusIcon(order.status)}
                          <span>{getStatusLabel(order.status)}</span>
                        </Badge>
                        {order.delivered && (
                          <Badge className="bg-green-100 text-green-800">
                            Entregue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Customer */}
                      <div>
                        <h4 className="font-semibold text-brown mb-1 text-sm">
                          Cliente
                        </h4>
                        <p className="text-brown-light text-sm">
                          {order.customerName}
                        </p>
                        <p className="text-brown-light text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.customerPhone}
                        </p>
                      </div>

                      {/* Address */}
                      <div>
                        <h4 className="font-semibold text-brown mb-1 text-sm">
                          Endereço
                        </h4>
                        <p className="text-brown-light text-xs">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {order.address.street}, {order.address.number}
                          {order.address.complement &&
                            `, ${order.address.complement}`}
                        </p>
                        <p className="text-brown-light text-xs">
                          {order.address.neighborhood}, {order.address.city}
                        </p>
                      </div>

                      {/* Marmita Details */}
                      <div>
                        <h4 className="font-semibold text-brown mb-2 text-sm">
                          Pedido
                        </h4>
                        <div className="bg-cream/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-brown">
                              Marmita {getSizeLabel(order.item.size)}
                            </span>
                            <Badge variant="outline">
                              {order.item.options.quantidade}x
                            </Badge>
                          </div>

                          {(order.item.options.salada ||
                            order.item.options.torresmo ||
                            order.item.options.talheres ||
                            order.item.options.drinks.length > 0) && (
                            <div className="space-y-1">
                              {order.item.options.salada && (
                                <div className="flex items-center text-xs text-green-600">
                                  <Salad className="h-3 w-3 mr-1" />
                                  Salada
                                </div>
                              )}
                              {order.item.options.torresmo && (
                                <div className="flex items-center text-xs text-orange">
                                  <Ham className="h-3 w-3 mr-1" />
                                  Torresmo
                                </div>
                              )}
                              {order.item.options.talheres && (
                                <div className="flex items-center text-xs text-brown-light">
                                  <UtensilsCrossed className="h-3 w-3 mr-1" />
                                  Talheres
                                </div>
                              )}
                              {order.item.options.drinks.map((drink) => (
                                <div
                                  key={drink.type}
                                  className="flex items-center text-xs text-blue-600"
                                >
                                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-1 text-[8px] text-white flex items-center justify-center font-bold">
                                    {drink.type === "coca-lata"
                                      ? "C"
                                      : drink.type === "guarana-lata"
                                        ? "G"
                                        : "S"}
                                  </span>
                                  {drink.type === "coca-lata"
                                    ? "Coca-Cola"
                                    : drink.type === "guarana-lata"
                                      ? "Guaraná"
                                      : "Sprite"}{" "}
                                  ({drink.quantity}x)
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-brown-light">
                          {order.paymentMethod}
                        </span>
                        <span className="text-lg font-bold text-orange">
                          R$ {(order.total || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3 pt-3 border-t">
                        {/* Status Update */}
                        {!order.delivered && (
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-brown">
                              Atualizar Status
                            </Label>
                            <div className="flex flex-wrap gap-1">
                              {order.status === "pendente" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      updateOrderStatus(order.id, "preparando")
                                    }
                                    className="bg-orange hover:bg-orange-dark text-xs"
                                  >
                                    Preparar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      updateOrderStatus(order.id, "cancelado")
                                    }
                                    className="text-xs"
                                  >
                                    Cancelar
                                  </Button>
                                </>
                              )}
                              {order.status === "preparando" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatus(order.id, "pronta")
                                  }
                                  className="bg-orange hover:bg-orange-dark text-xs"
                                >
                                  Marcar Pronta
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Delivery Status */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`delivered-${order.id}`}
                            checked={order.delivered}
                            onCheckedChange={(checked) =>
                              toggleDeliveryStatus(order.id, !!checked)
                            }
                          />
                          <label
                            htmlFor={`delivered-${order.id}`}
                            className="text-sm text-brown cursor-pointer"
                          >
                            Entregue
                          </label>
                        </div>

                        {/* Receipt */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver Recibo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                Recibo - Pedido #{order.id.slice(-6)}
                              </DialogTitle>
                              <DialogDescription>
                                Detalhes completos do pedido
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Cliente</h4>
                                <p>{order.customerName}</p>
                                <p>{order.customerPhone}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Endereço</h4>
                                <p>
                                  {order.address.street}, {order.address.number}
                                  {order.address.complement &&
                                    `, ${order.address.complement}`}
                                </p>
                                <p>
                                  {order.address.neighborhood},{" "}
                                  {order.address.city}
                                </p>
                                <p>CEP: {order.address.zipCode}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Pedido</h4>
                                <p>
                                  Marmita {getSizeLabel(order.item.size)} (
                                  {order.item.options.quantidade}x)
                                </p>
                                <p>
                                  R$ {(order.item.unitPrice || 0).toFixed(2)}{" "}
                                  cada
                                </p>
                                {order.item.options.salada && <p>+ Salada</p>}
                                {order.item.options.torresmo && (
                                  <p>+ Torresmo</p>
                                )}
                                {order.item.options.talheres && (
                                  <p>+ Talheres</p>
                                )}
                                {order.item.options.drinks.map((drink) => (
                                  <p key={drink.type}>
                                    +{" "}
                                    {drink.type === "coca-lata"
                                      ? "Coca-Cola"
                                      : drink.type === "guarana-lata"
                                        ? "Guaraná"
                                        : "Sprite"}{" "}
                                    ({drink.quantity}x)
                                  </p>
                                ))}
                              </div>
                              <div className="border-t pt-4">
                                <div className="flex justify-between font-bold">
                                  <span>Total:</span>
                                  <span>
                                    R$ {(order.total || 0).toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Pagamento: {order.paymentMethod}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
