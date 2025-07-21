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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Settings,
  UtensilsCrossed,
  Coffee,
  Star,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Ingredient,
  HouseSpecial,
  AvailableDrink,
  DrinkType,
  CreateIngredientRequest,
  CreateHouseSpecialRequest,
  CreateDrinkRequest,
} from "@shared/api";

export default function AdminConfig() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdmin();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [houseSpecials, setHouseSpecials] = useState<HouseSpecial[]>([]);
  const [availableDrinks, setAvailableDrinks] = useState<AvailableDrink[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [showAddHouseSpecial, setShowAddHouseSpecial] = useState(false);

  // Form states
  const [ingredientForm, setIngredientForm] = useState({ name: "" });
  const [drinkForm, setDrinkForm] = useState({
    type: "" as DrinkType,
    name: "",
    price: "",
  });
  const [houseSpecialForm, setHouseSpecialForm] = useState({
    name: "",
    description: "",
    ingredients: [] as string[],
  });

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async () => {
    if (!ingredientForm.name.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do ingrediente.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const request: CreateIngredientRequest = {
        name: ingredientForm.name.trim(),
      };

      const response = await fetch("/api/admin/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      if (data.success) {
        setIngredients([...ingredients, data.ingredient]);
        setIngredientForm({ name: "" });
        setShowAddIngredient(false);
        toast({
          title: "Sucesso",
          description: "Ingrediente adicionado com sucesso!",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o ingrediente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddDrink = async () => {
    if (!drinkForm.type || !drinkForm.name.trim() || !drinkForm.price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos da bebida.",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(drinkForm.price);
    if (price <= 0) {
      toast({
        title: "Erro",
        description: "O preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const request: CreateDrinkRequest = {
        type: drinkForm.type,
        name: drinkForm.name.trim(),
        price,
      };

      const response = await fetch("/api/admin/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      if (data.success) {
        setAvailableDrinks([...availableDrinks, data.drink]);
        setDrinkForm({ type: "" as DrinkType, name: "", price: "" });
        setShowAddDrink(false);
        toast({
          title: "Sucesso",
          description: "Bebida adicionada com sucesso!",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a bebida.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddHouseSpecial = async () => {
    if (
      !houseSpecialForm.name.trim() ||
      !houseSpecialForm.description.trim() ||
      houseSpecialForm.ingredients.length === 0
    ) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos e selecione ingredientes.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const request: CreateHouseSpecialRequest = {
        name: houseSpecialForm.name.trim(),
        description: houseSpecialForm.description.trim(),
        ingredients: houseSpecialForm.ingredients,
      };

      const response = await fetch("/api/admin/house-specials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      if (data.success) {
        setHouseSpecials([...houseSpecials, data.houseSpecial]);
        setHouseSpecialForm({ name: "", description: "", ingredients: [] });
        setShowAddHouseSpecial(false);
        toast({
          title: "Sucesso",
          description: "Moda da casa adicionada com sucesso!",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a moda da casa.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleAvailability = async (
    type: "ingredient" | "drink" | "houseSpecial",
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const endpoint = `/api/admin/${type === "houseSpecial" ? "house-specials" : type === "ingredient" ? "ingredients" : "drinks"}/${id}/toggle`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        if (type === "ingredient") {
          setIngredients(
            ingredients.map((item) =>
              item.id === id ? { ...item, available: !currentStatus } : item,
            ),
          );
        } else if (type === "drink") {
          setAvailableDrinks(
            availableDrinks.map((item) =>
              item.id === id ? { ...item, available: !currentStatus } : item,
            ),
          );
        } else {
          setHouseSpecials(
            houseSpecials.map((item) =>
              item.id === id ? { ...item, available: !currentStatus } : item,
            ),
          );
        }
        toast({
          title: "Sucesso",
          description: `Item ${!currentStatus ? "ativado" : "desativado"} com sucesso!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a disponibilidade.",
        variant: "destructive",
      });
    }
  };

  const toggleHouseSpecialIngredient = (ingredientId: string) => {
    const current = houseSpecialForm.ingredients;
    if (current.includes(ingredientId)) {
      setHouseSpecialForm({
        ...houseSpecialForm,
        ingredients: current.filter((id) => id !== ingredientId),
      });
    } else {
      setHouseSpecialForm({
        ...houseSpecialForm,
        ingredients: [...current, ingredientId],
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-12 w-12 text-orange mx-auto mb-4 animate-pulse" />
          <p className="text-brown-light">Carregando configurações...</p>
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
                  <Settings className="h-6 w-6 text-orange mr-2" />
                  Configurações do Cardápio
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/financas")}
                className="border-orange text-orange hover:bg-orange/10"
              >
                Finanças
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="ingredients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ingredients" className="flex items-center">
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Ingredientes
            </TabsTrigger>
            <TabsTrigger value="drinks" className="flex items-center">
              <Coffee className="h-4 w-4 mr-2" />
              Bebidas
            </TabsTrigger>
            <TabsTrigger value="house-specials" className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Moda da Casa
            </TabsTrigger>
          </TabsList>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brown">Ingredientes</h2>
                <p className="text-brown-light">
                  Gerencie os ingredientes disponíveis para marmitas
                  personalizadas
                </p>
              </div>
              <Dialog
                open={showAddIngredient}
                onOpenChange={setShowAddIngredient}
              >
                <DialogTrigger asChild>
                  <Button className="bg-orange hover:bg-orange-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Ingrediente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Ingrediente</DialogTitle>
                    <DialogDescription>
                      Adicione um novo ingrediente ao cardápio
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ingredient-name">
                        Nome do Ingrediente
                      </Label>
                      <Input
                        id="ingredient-name"
                        value={ingredientForm.name}
                        onChange={(e) =>
                          setIngredientForm({
                            ...ingredientForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Ex: Arroz, Feijão, Carne..."
                      />
                    </div>
                    <Button
                      onClick={handleAddIngredient}
                      disabled={processing}
                      className="w-full bg-orange hover:bg-orange-dark"
                    >
                      {processing ? "Adicionando..." : "Adicionar Ingrediente"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ingredients.map((ingredient) => (
                <Card key={ingredient.id} className="bg-white shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-brown">
                          {ingredient.name}
                        </h3>
                        <p className="text-xs text-brown-light">
                          {new Date(ingredient.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            ingredient.available ? "default" : "secondary"
                          }
                          className={
                            ingredient.available
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {ingredient.available ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleAvailability(
                              "ingredient",
                              ingredient.id,
                              ingredient.available,
                            )
                          }
                        >
                          {ingredient.available ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {ingredients.length === 0 && (
              <div className="text-center py-12">
                <UtensilsCrossed className="h-16 w-16 text-orange/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-brown mb-2">
                  Nenhum ingrediente cadastrado
                </h3>
                <p className="text-brown-light">
                  Adicione ingredientes para permitir marmitas personalizadas.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Drinks Tab */}
          <TabsContent value="drinks" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brown">Bebidas</h2>
                <p className="text-brown-light">
                  Gerencie as bebidas disponíveis para acompanhar as marmitas
                </p>
              </div>
              <Dialog open={showAddDrink} onOpenChange={setShowAddDrink}>
                <DialogTrigger asChild>
                  <Button className="bg-orange hover:bg-orange-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Bebida
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Bebida</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova bebida ao cardápio
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="drink-type">Tipo</Label>
                      <Select
                        value={drinkForm.type}
                        onValueChange={(value) =>
                          setDrinkForm({
                            ...drinkForm,
                            type: value as DrinkType,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coca-lata">
                            Coca-Cola Lata
                          </SelectItem>
                          <SelectItem value="guarana-lata">
                            Guaraná Lata
                          </SelectItem>
                          <SelectItem value="sprite-lata">
                            Sprite Lata
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="drink-name">Nome da Bebida</Label>
                      <Input
                        id="drink-name"
                        value={drinkForm.name}
                        onChange={(e) =>
                          setDrinkForm({ ...drinkForm, name: e.target.value })
                        }
                        placeholder="Ex: Coca-Cola Lata 350ml"
                      />
                    </div>
                    <div>
                      <Label htmlFor="drink-price">Preço (R$)</Label>
                      <Input
                        id="drink-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={drinkForm.price}
                        onChange={(e) =>
                          setDrinkForm({ ...drinkForm, price: e.target.value })
                        }
                        placeholder="0,00"
                      />
                    </div>
                    <Button
                      onClick={handleAddDrink}
                      disabled={processing}
                      className="w-full bg-orange hover:bg-orange-dark"
                    >
                      {processing ? "Adicionando..." : "Adicionar Bebida"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDrinks.map((drink) => (
                <Card key={drink.id} className="bg-white shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-brown">
                          {drink.name}
                        </h3>
                        <p className="text-orange font-bold">
                          R$ {drink.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-brown-light">
                          {new Date(drink.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={drink.available ? "default" : "secondary"}
                          className={
                            drink.available
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {drink.available ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleAvailability(
                              "drink",
                              drink.id,
                              drink.available,
                            )
                          }
                        >
                          {drink.available ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {availableDrinks.length === 0 && (
              <div className="text-center py-12">
                <Coffee className="h-16 w-16 text-orange/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-brown mb-2">
                  Nenhuma bebida cadastrada
                </h3>
                <p className="text-brown-light">
                  Adicione bebidas para oferecer aos clientes.
                </p>
              </div>
            )}
          </TabsContent>

          {/* House Specials Tab */}
          <TabsContent value="house-specials" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brown">Moda da Casa</h2>
                <p className="text-brown-light">
                  Gerencie as combinações especiais do restaurante
                </p>
              </div>
              <Dialog
                open={showAddHouseSpecial}
                onOpenChange={setShowAddHouseSpecial}
              >
                <DialogTrigger asChild>
                  <Button className="bg-orange hover:bg-orange-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Moda da Casa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Moda da Casa</DialogTitle>
                    <DialogDescription>
                      Crie uma combinação especial de ingredientes
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="special-name">Nome</Label>
                      <Input
                        id="special-name"
                        value={houseSpecialForm.name}
                        onChange={(e) =>
                          setHouseSpecialForm({
                            ...houseSpecialForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Ex: Marmita Tradicional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="special-description">Descrição</Label>
                      <Textarea
                        id="special-description"
                        value={houseSpecialForm.description}
                        onChange={(e) =>
                          setHouseSpecialForm({
                            ...houseSpecialForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Descreva o que torna esta marmita especial..."
                      />
                    </div>
                    <div>
                      <Label>Ingredientes</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                        {ingredients
                          .filter((ing) => ing.available)
                          .map((ingredient) => (
                            <div
                              key={ingredient.id}
                              className="flex items-center space-x-2 p-2 border rounded"
                            >
                              <Checkbox
                                checked={houseSpecialForm.ingredients.includes(
                                  ingredient.id,
                                )}
                                onCheckedChange={() =>
                                  toggleHouseSpecialIngredient(ingredient.id)
                                }
                              />
                              <Label className="text-sm">
                                {ingredient.name}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>
                    <Button
                      onClick={handleAddHouseSpecial}
                      disabled={processing}
                      className="w-full bg-orange hover:bg-orange-dark"
                    >
                      {processing ? "Adicionando..." : "Adicionar Moda da Casa"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {houseSpecials.map((special) => (
                <Card key={special.id} className="bg-white shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-brown">
                        {special.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={special.available ? "default" : "secondary"}
                          className={
                            special.available
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {special.available ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleAvailability(
                              "houseSpecial",
                              special.id,
                              special.available,
                            )
                          }
                        >
                          {special.available ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{special.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-sm font-semibold">
                        Ingredientes:
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-2">
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
                    <p className="text-xs text-brown-light mt-4">
                      Criado em{" "}
                      {new Date(special.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {houseSpecials.length === 0 && (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-orange/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-brown mb-2">
                  Nenhuma moda da casa cadastrada
                </h3>
                <p className="text-brown-light">
                  Crie combinações especiais para oferecer aos clientes.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
