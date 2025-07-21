import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ChefHat,
  ArrowLeft,
  Plus,
  Minus,
  UtensilsCrossed,
  Star,
  Settings,
  CreditCard,
  CheckCircle,
  Salad,
  Ham,
} from "lucide-react";
import {
  MarmitaSize,
  MarmitaOptions,
  Address,
  CreateOrderRequest,
  OrderingType,
  Ingredient,
  HouseSpecial,
  AvailableDrink,
} from "@shared/api";

type Step = "type" | "options" | "customer" | "payment" | "confirmation";

export default function Pedido() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>("");

  const [selectedSize, setSelectedSize] = useState<MarmitaSize>(
    (searchParams.get("size") as MarmitaSize) || "media",
  );

  const [options, setOptions] = useState<MarmitaOptions>({
    orderingType: "moda-da-casa",
    salada: false,
    torresmo: false,
    talheres: false,
    quantidade: 1,
    wantsDrinks: false,
    drinks: [],
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [houseSpecials, setHouseSpecials] = useState<HouseSpecial[]>([]);
  const [availableDrinks, setAvailableDrinks] = useState<AvailableDrink[]>([]);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
  });

  const [address, setAddress] = useState<Address>({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    zipCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("");

  const marmitaPrices = {
    pequena: 12.0,
    media: 15.0,
    grande: 18.0,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch ingredients, house specials, and available drinks
      const [ingredientsRes, houseSpecialsRes, drinksRes] = await Promise.all([
        fetch("/api/admin/ingredients"),
        fetch("/api/admin/house-specials"),
        fetch("/api/admin/drinks"),
      ]);

      const [ingredientsData, houseSpecialsData, drinksData] =
        await Promise.all([
          ingredientsRes.json(),
          houseSpecialsRes.json(),
          drinksRes.json(),
        ]);

      if (ingredientsData.success) setIngredients(ingredientsData.ingredients);
      if (houseSpecialsData.success)
        setHouseSpecials(houseSpecialsData.houseSpecials);
      if (drinksData.success) setAvailableDrinks(drinksData.drinks);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const unitPrice = marmitaPrices[selectedSize];
  const drinksTotal = options.drinks.reduce((total, drink) => {
    const availableDrink = availableDrinks.find((d) => d.id === drink.type);
    return total + (availableDrink?.price || 0) * drink.quantity;
  }, 0);
  const totalPrice = unitPrice * options.quantidade + drinksTotal;

  const getSizeLabel = (size: MarmitaSize) => {
    switch (size) {
      case "pequena":
        return "Pequena";
      case "media":
        return "Média";
      case "grande":
        return "Grande";
    }
  };

  const handleTypeNext = () => {
    if (
      options.orderingType === "moda-da-casa" &&
      !options.houseSpecialId &&
      houseSpecials.length > 0
    ) {
      toast({
        title: "Seleção necessária",
        description: "Escolha uma opção da moda da casa.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("options");
  };

  const handleOptionsNext = () => {
    if (options.quantidade < 1) {
      toast({
        title: "Quantidade inválida",
        description: "Selecione pelo menos 1 marmita.",
        variant: "destructive",
      });
      return;
    }

    if (
      options.orderingType === "personalizada" &&
      (!options.selectedIngredients || options.selectedIngredients.length === 0)
    ) {
      toast({
        title: "Ingredientes necessários",
        description: "Selecione pelo menos um ingrediente.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep("customer");
  };

  const handleCustomerNext = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Dados incompletos",
        description: "Preencha nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    if (
      !address.street ||
      !address.number ||
      !address.neighborhood ||
      !address.city ||
      !address.zipCode
    ) {
      toast({
        title: "Endereço incompleto",
        description: "Preencha todos os campos do endereço.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep("payment");
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Forma de pagamento",
        description: "Selecione uma forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const orderData: CreateOrderRequest = {
        item: {
          size: selectedSize,
          options,
        },
        address,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        paymentMethod,
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
        setOrderId(result.order.id);
        setCurrentStep("confirmation");
        toast({
          title: "Pedido realizado!",
          description: "Seu pedido foi confirmado com sucesso.",
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
      setLoading(false);
    }
  };

  const toggleIngredient = (ingredientId: string) => {
    const current = options.selectedIngredients || [];
    if (current.includes(ingredientId)) {
      setOptions({
        ...options,
        selectedIngredients: current.filter((id) => id !== ingredientId),
      });
    } else {
      setOptions({
        ...options,
        selectedIngredients: [...current, ingredientId],
      });
    }
  };

  const addDrink = (drinkId: string) => {
    const existingDrink = options.drinks.find(
      (drink) => drink.type === drinkId,
    );

    if (existingDrink) {
      setOptions({
        ...options,
        drinks: options.drinks.map((drink) =>
          drink.type === drinkId
            ? { ...drink, quantity: drink.quantity + 1 }
            : drink,
        ),
      });
    } else {
      setOptions({
        ...options,
        drinks: [...options.drinks, { type: drinkId as any, quantity: 1 }],
      });
    }
  };

  const removeDrink = (drinkId: string) => {
    setOptions({
      ...options,
      drinks: options.drinks
        .map((drink) =>
          drink.type === drinkId
            ? { ...drink, quantity: drink.quantity - 1 }
            : drink,
        )
        .filter((drink) => drink.quantity > 0),
    });
  };

  const getDrinkQuantity = (drinkId: string) => {
    const drink = options.drinks.find((d) => d.type === drinkId);
    return drink ? drink.quantity : 0;
  };

  const renderTypeStep = () => (
    <Card className="bg-white shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-brown flex items-center">
          <ChefHat className="h-6 w-6 text-orange mr-2" />
          Como Quer sua Marmita?
        </CardTitle>
        <CardDescription>
          Marmita {getSizeLabel(selectedSize)} - R$ {unitPrice.toFixed(2)} cada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Size Selection */}
        <div>
          <Label className="text-base font-semibold">Tamanho</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {(["pequena", "media", "grande"] as MarmitaSize[]).map((size) => (
              <Button
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                onClick={() => setSelectedSize(size)}
                className={
                  selectedSize === size
                    ? "bg-orange hover:bg-orange-dark"
                    : "border-orange text-orange hover:bg-orange/10"
                }
              >
                {getSizeLabel(size)}
                <br />
                <span className="text-xs">
                  R$ {marmitaPrices[size].toFixed(2)}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Type Selection */}
        <div>
          <Label className="text-base font-semibold">Tipo de Marmita</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Card
              className={`cursor-pointer transition-all ${
                options.orderingType === "moda-da-casa"
                  ? "ring-2 ring-orange bg-orange/5"
                  : "hover:bg-gray-50"
              }`}
              onClick={() =>
                setOptions({ ...options, orderingType: "moda-da-casa" })
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 text-orange" />
                  <CardTitle className="text-lg">Moda da Casa</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Combinações especiais criadas pelo nosso chef
                </CardDescription>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                options.orderingType === "personalizada"
                  ? "ring-2 ring-orange bg-orange/5"
                  : "hover:bg-gray-50"
              }`}
              onClick={() =>
                setOptions({ ...options, orderingType: "personalizada" })
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Settings className="h-6 w-6 text-orange" />
                  <CardTitle className="text-lg">Personalizada</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monte sua marmita do seu jeito
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* House Special Selection */}
        {options.orderingType === "moda-da-casa" &&
          houseSpecials.length > 0 && (
            <div>
              <Label className="text-base font-semibold">
                Escolha da Moda da Casa
              </Label>
              <div className="space-y-3 mt-2">
                {houseSpecials
                  .filter((special) => special.available)
                  .map((special) => (
                    <Card
                      key={special.id}
                      className={`cursor-pointer transition-all ${
                        options.houseSpecialId === special.id
                          ? "ring-2 ring-orange bg-orange/5"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setOptions({ ...options, houseSpecialId: special.id })
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-brown">
                              {special.name}
                            </h4>
                            <p className="text-sm text-brown-light mb-2">
                              {special.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {special.ingredients.map((ingredientId) => {
                                const ingredient = ingredients.find(
                                  (ing) => ing.id === ingredientId,
                                );
                                return (
                                  ingredient && (
                                    <Badge
                                      key={ingredientId}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {ingredient.name}
                                    </Badge>
                                  )
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

        {/* Custom Ingredients */}
        {options.orderingType === "personalizada" && ingredients.length > 0 && (
          <div>
            <Label className="text-base font-semibold">
              Escolha seus Ingredientes
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {ingredients
                .filter((ingredient) => ingredient.available)
                .map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      options.selectedIngredients?.includes(ingredient.id)
                        ? "bg-orange/10 border-orange"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleIngredient(ingredient.id)}
                  >
                    <Checkbox
                      checked={
                        options.selectedIngredients?.includes(ingredient.id) ||
                        false
                      }
                      readOnly
                    />
                    <Label className="cursor-pointer text-sm">
                      {ingredient.name}
                    </Label>
                  </div>
                ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleTypeNext}
          className="w-full bg-orange hover:bg-orange-dark"
          size="lg"
        >
          Continuar
        </Button>
      </CardContent>
    </Card>
  );

  const renderOptionsStep = () => (
    <Card className="bg-white shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-brown">Opções Adicionais</CardTitle>
        <CardDescription>
          Complete seu pedido com extras e bebidas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quantity */}
        <div>
          <Label className="text-base font-semibold">Quantidade</Label>
          <div className="flex items-center space-x-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setOptions({
                  ...options,
                  quantidade: Math.max(1, options.quantidade - 1),
                })
              }
              disabled={options.quantidade <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xl font-semibold text-brown w-12 text-center">
              {options.quantidade}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setOptions({
                  ...options,
                  quantidade: options.quantidade + 1,
                })
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Adicionais */}
        <div>
          <Label className="text-base font-semibold">Adicionais</Label>
          <div className="space-y-3 mt-2">
            {/* Salada */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id="salada"
                checked={options.salada}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, salada: !!checked })
                }
              />
              <Label
                htmlFor="salada"
                className="flex items-center cursor-pointer"
              >
                <Salad className="h-5 w-5 text-green-600 mr-2" />
                Salada
              </Label>
            </div>

            {/* Torresmo */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id="torresmo"
                checked={options.torresmo}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, torresmo: !!checked })
                }
              />
              <Label
                htmlFor="torresmo"
                className="flex items-center cursor-pointer"
              >
                <Ham className="h-5 w-5 text-orange mr-2" />
                Torresmo
              </Label>
            </div>

            {/* Talheres */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id="talheres"
                checked={options.talheres}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, talheres: !!checked })
                }
              />
              <Label
                htmlFor="talheres"
                className="flex items-center cursor-pointer"
              >
                <UtensilsCrossed className="h-5 w-5 text-brown mr-2" />
                Talheres
              </Label>
            </div>
          </div>
        </div>

        {/* Drinks Question */}
        <div>
          <Label className="text-base font-semibold">Quer bebida?</Label>
          <div className="flex space-x-3 mt-2">
            <Button
              variant={options.wantsDrinks ? "default" : "outline"}
              onClick={() => setOptions({ ...options, wantsDrinks: true })}
              className={
                options.wantsDrinks
                  ? "bg-orange hover:bg-orange-dark"
                  : "border-orange text-orange hover:bg-orange/10"
              }
            >
              Sim
            </Button>
            <Button
              variant={!options.wantsDrinks ? "default" : "outline"}
              onClick={() =>
                setOptions({ ...options, wantsDrinks: false, drinks: [] })
              }
              className={
                !options.wantsDrinks
                  ? "bg-orange hover:bg-orange-dark"
                  : "border-orange text-orange hover:bg-orange/10"
              }
            >
              Não
            </Button>
          </div>
        </div>

        {/* Drinks Selection */}
        {options.wantsDrinks && availableDrinks.length > 0 && (
          <div>
            <Label className="text-base font-semibold">
              Escolha suas Bebidas
            </Label>
            <div className="space-y-3 mt-2">
              {availableDrinks
                .filter((drink) => drink.available)
                .map((drink) => {
                  const quantity = getDrinkQuantity(drink.id);
                  return (
                    <div
                      key={drink.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-brown">
                          {drink.name}
                        </span>
                        <p className="text-sm text-brown-light">
                          R$ {drink.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDrink(drink.id)}
                          disabled={quantity === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-brown font-medium w-8 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addDrink(drink.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="bg-cream/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-brown">Total:</span>
            <span className="text-2xl font-bold text-orange">
              R$ {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("type")}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            onClick={handleOptionsNext}
            className="flex-1 bg-orange hover:bg-orange-dark"
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCustomerStep = () => (
    <Card className="bg-white shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-brown">Dados para Entrega</CardTitle>
        <CardDescription>
          Informe seus dados e endereço para entrega
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, name: e.target.value })
              }
              placeholder="Seu nome"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={customerInfo.phone}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, phone: e.target.value })
              }
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="font-semibold text-brown">Endereço de Entrega</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                placeholder="Nome da rua"
              />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={address.number}
                onChange={(e) =>
                  setAddress({ ...address, number: e.target.value })
                }
                placeholder="123"
              />
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={address.complement}
                onChange={(e) =>
                  setAddress({ ...address, complement: e.target.value })
                }
                placeholder="Apto, bloco, etc."
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={address.neighborhood}
                onChange={(e) =>
                  setAddress({ ...address, neighborhood: e.target.value })
                }
                placeholder="Nome do bairro"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                placeholder="Nome da cidade"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={address.zipCode}
                onChange={(e) =>
                  setAddress({ ...address, zipCode: e.target.value })
                }
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("options")}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            onClick={handleCustomerNext}
            className="flex-1 bg-orange hover:bg-orange-dark"
          >
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card className="bg-white shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-brown flex items-center">
          <CreditCard className="h-6 w-6 text-orange mr-2" />
          Pagamento
        </CardTitle>
        <CardDescription>Escolha como deseja pagar seu pedido</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-cream/30 p-4 rounded-lg">
          <h3 className="font-semibold text-brown mb-3">Resumo do Pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Marmita {getSizeLabel(selectedSize)}</span>
              <span>R$ {unitPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantidade</span>
              <span>{options.quantidade}x</span>
            </div>
            {options.salada && (
              <div className="flex justify-between text-green-600">
                <span>+ Salada</span>
                <span>Incluído</span>
              </div>
            )}
            {options.torresmo && (
              <div className="flex justify-between text-orange">
                <span>+ Torresmo</span>
                <span>Incluído</span>
              </div>
            )}
            {options.talheres && (
              <div className="flex justify-between">
                <span>+ Talheres</span>
                <span>Incluído</span>
              </div>
            )}
            {options.drinks.map((drink) => {
              const drinkInfo = availableDrinks.find(
                (d) => d.id === drink.type,
              );
              return (
                drinkInfo && (
                  <div
                    key={drink.type}
                    className="flex justify-between text-blue-600"
                  >
                    <span>
                      + {drinkInfo.name} ({drink.quantity}x)
                    </span>
                    <span>
                      R$ {(drinkInfo.price * drink.quantity).toFixed(2)}
                    </span>
                  </div>
                )
              );
            })}
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange">R$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <Label className="text-base font-semibold">Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro na Entrega</SelectItem>
              <SelectItem value="cartao">Cartão na Entrega</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("customer")}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-orange hover:bg-orange-dark"
          >
            {loading ? "Processando..." : `Pagar R$ ${totalPrice.toFixed(2)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderConfirmationStep = () => (
    <Card className="bg-white shadow-lg max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-brown text-2xl">Pedido Realizado!</CardTitle>
        <CardDescription>
          Seu pedido foi confirmado e está sendo preparado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="bg-cream/30 p-4 rounded-lg">
          <p className="text-brown-light mb-2">Número do Pedido</p>
          <p className="text-2xl font-bold text-orange">#{orderId.slice(-6)}</p>
        </div>

        <div className="space-y-2 text-brown-light">
          <p>Tempo estimado de entrega: 30-45 minutos</p>
          <p>Valor pago: R$ {totalPrice.toFixed(2)}</p>
          <p>Acompanhe seu pedido pelo telefone: (11) 99999-9999</p>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="w-full bg-orange hover:bg-orange-dark"
          size="lg"
        >
          Fazer Novo Pedido
        </Button>
      </CardContent>
    </Card>
  );

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
                  <ChefHat className="h-6 w-6 text-orange mr-2" />
                  Fazer Pedido
                </h1>
              </div>
            </div>
            {currentStep !== "confirmation" && (
              <div className="flex items-center space-x-2">
                <Badge
                  variant={currentStep === "type" ? "default" : "secondary"}
                  className={
                    currentStep === "type"
                      ? "bg-orange"
                      : "bg-gray-200 text-gray-600"
                  }
                >
                  1. Tipo
                </Badge>
                <Badge
                  variant={currentStep === "options" ? "default" : "secondary"}
                  className={
                    currentStep === "options"
                      ? "bg-orange"
                      : "bg-gray-200 text-gray-600"
                  }
                >
                  2. Opções
                </Badge>
                <Badge
                  variant={currentStep === "customer" ? "default" : "secondary"}
                  className={
                    currentStep === "customer"
                      ? "bg-orange"
                      : "bg-gray-200 text-gray-600"
                  }
                >
                  3. Dados
                </Badge>
                <Badge
                  variant={currentStep === "payment" ? "default" : "secondary"}
                  className={
                    currentStep === "payment"
                      ? "bg-orange"
                      : "bg-gray-200 text-gray-600"
                  }
                >
                  4. Pagamento
                </Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "type" && renderTypeStep()}
        {currentStep === "options" && renderOptionsStep()}
        {currentStep === "customer" && renderCustomerStep()}
        {currentStep === "payment" && renderPaymentStep()}
        {currentStep === "confirmation" && renderConfirmationStep()}
      </main>
    </div>
  );
}
