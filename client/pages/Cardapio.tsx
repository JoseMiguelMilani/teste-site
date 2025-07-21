import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Package,
} from "lucide-react";
import { ProductSize, OrderItem, Address } from "@shared/api";

interface CartItem extends OrderItem {
  id: string;
}

interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  address: Address;
  paymentMethod: string;
}

export default function Cardapio() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    customerName: "",
    customerPhone: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      zipCode: "",
    },
    paymentMethod: "",
  });

  const menuItems = [
    {
      id: "classic-burger",
      name: "Hambúrguer Clássico",
      description:
        "Pão artesanal, carne bovina 150g, queijo cheddar, alface americana, tomate, cebola roxa e molho especial da casa",
      prices: { pequeno: 18.9, medio: 24.9, grande: 29.9 },
      available: true,
    },
    {
      id: "chicken-burger",
      name: "Hambúrguer de Frango",
      description:
        "Peito de frango grelhado 130g, queijo prato, alface americana, tomate, cebola caramelizada e maionese temperada",
      prices: { pequeno: 16.9, medio: 22.9, grande: 27.9 },
      available: true,
    },
    {
      id: "veggie-burger",
      name: "Hambúrguer Vegetariano",
      description:
        "Hambúrguer artesanal de grão-de-bico e quinoa, queijo vegano, rúcula, tomate seco e molho de ervas finas",
      prices: { pequeno: 15.9, medio: 21.9, grande: 26.9 },
      available: true,
    },
    {
      id: "bacon-burger",
      name: "Bacon Burger",
      description:
        "Carne bovina 180g, bacon crocante, queijo cheddar duplo, cebola crispy, alface e molho barbecue",
      prices: { pequeno: 22.9, medio: 28.9, grande: 34.9 },
      available: true,
    },
    {
      id: "fish-burger",
      name: "Fish Burger",
      description:
        "Filé de peixe empanado, queijo, alface americana, tomate e molho tártaro caseiro",
      prices: { pequeno: 19.9, medio: 25.9, grande: 31.9 },
      available: true,
    },
    {
      id: "double-burger",
      name: "Double Smash",
      description:
        "Dois hambúrguers smash 80g cada, queijo cheddar, picles, cebola e molho especial",
      prices: { pequeno: 24.9, medio: 30.9, grande: 36.9 },
      available: true,
    },
  ];

  const addToCart = (
    productId: string,
    productName: string,
    size: ProductSize,
  ) => {
    const product = menuItems.find((item) => item.id === productId);
    if (!product) return;

    const price = product.prices[size];
    const existingItem = cart.find(
      (item) => item.productId === productId && item.size === size,
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      const newItem: CartItem = {
        id: `${productId}-${size}-${Date.now()}`,
        productId,
        productName,
        size,
        quantity: 1,
        price,
      };
      setCart([...cart, newItem]);
    }

    toast({
      title: "Item adicionado!",
      description: `${productName} (${size}) foi adicionado ao carrinho.`,
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== itemId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione alguns itens ao carrinho primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: cart.map(({ id, ...item }) => item),
        address: checkoutForm.address,
        customerName: checkoutForm.customerName,
        customerPhone: checkoutForm.customerPhone,
        paymentMethod: checkoutForm.paymentMethod,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Pedido realizado!",
          description: `Seu pedido #${result.order.id.slice(-6)} foi confirmado.`,
        });
        setCart([]);
        setShowCheckout(false);
        setCheckoutForm({
          customerName: "",
          customerPhone: "",
          address: {
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            zipCode: "",
          },
          paymentMethod: "",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Erro no pedido",
        description: "Não foi possível processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSizeLabel = (size: ProductSize) => {
    switch (size) {
      case "pequeno":
        return "P";
      case "medio":
        return "M";
      case "grande":
        return "G";
    }
  };

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
                  <ChefHat className="h-6 w-6 text-orange mr-2" />
                  Cardápio
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(true)}
                  className="border-orange text-orange hover:bg-orange/10"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Carrinho ({cart.length})
                </Button>
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange text-xs">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              className="bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader className="p-0">
                <div className="aspect-[4/3] bg-warm-gray rounded-t-lg flex items-center justify-center">
                  <Package className="h-12 w-12 text-orange/50" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-brown mb-2">{item.name}</CardTitle>
                <CardDescription className="text-brown-light mb-4 text-sm leading-relaxed">
                  {item.description}
                </CardDescription>

                <div className="space-y-3">
                  {Object.entries(item.prices).map(([size, price]) => (
                    <div
                      key={size}
                      className="flex items-center justify-between p-3 rounded-lg bg-cream/30"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="text-xs">
                          {getSizeLabel(size as ProductSize)}
                        </Badge>
                        <span className="font-semibold text-brown">
                          R$ {price.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          addToCart(item.id, item.name, size as ProductSize)
                        }
                        className="bg-orange hover:bg-orange-dark"
                        disabled={!item.available}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brown">Finalizar Pedido</DialogTitle>
            <DialogDescription>
              Revise seus itens e complete as informações para finalizar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cart Items */}
            <div>
              <h3 className="font-semibold text-brown mb-3">Seus Itens</h3>
              {cart.length === 0 ? (
                <p className="text-brown-light">Seu carrinho está vazio.</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-cream/30 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-brown">
                          {item.productName}
                        </span>
                        <span className="text-sm text-brown-light ml-2">
                          ({getSizeLabel(item.size)})
                        </span>
                        <div className="text-sm text-brown-light">
                          R$ {item.price.toFixed(2)} cada
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-brown font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right pt-2 border-t">
                    <span className="text-lg font-bold text-brown">
                      Total: R$ {getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Info */}
            {cart.length > 0 && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-brown">Seus Dados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={checkoutForm.customerName}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            customerName: e.target.value,
                          })
                        }
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={checkoutForm.customerPhone}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            customerPhone: e.target.value,
                          })
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-brown">
                    Endereço de Entrega
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={checkoutForm.address.street}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            address: {
                              ...checkoutForm.address,
                              street: e.target.value,
                            },
                          })
                        }
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={checkoutForm.address.number}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            address: {
                              ...checkoutForm.address,
                              number: e.target.value,
                            },
                          })
                        }
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={checkoutForm.address.complement}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            address: {
                              ...checkoutForm.address,
                              complement: e.target.value,
                            },
                          })
                        }
                        placeholder="Apto, bloco, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={checkoutForm.address.neighborhood}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            address: {
                              ...checkoutForm.address,
                              neighborhood: e.target.value,
                            },
                          })
                        }
                        placeholder="Nome do bairro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={checkoutForm.address.city}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            address: {
                              ...checkoutForm.address,
                              city: e.target.value,
                            },
                          })
                        }
                        placeholder="Nome da cidade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={checkoutForm.address.zipCode}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            address: {
                              ...checkoutForm.address,
                              zipCode: e.target.value,
                            },
                          })
                        }
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="payment">Forma de Pagamento</Label>
                  <Select
                    value={checkoutForm.paymentMethod}
                    onValueChange={(value) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        paymentMethod: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão na Entrega</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-orange hover:bg-orange-dark"
                  size="lg"
                >
                  {isProcessing
                    ? "Processando..."
                    : `Finalizar Pedido - R$ ${getTotalPrice().toFixed(2)}`}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
