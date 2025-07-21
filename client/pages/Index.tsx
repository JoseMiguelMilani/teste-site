import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "@/hooks/use-toast";
import {
  ChefHat,
  Clock,
  MapPin,
  Phone,
  Star,
  UtensilsCrossed,
  Shield,
  Heart,
  Camera,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { MarmitaSize } from "@shared/api";

export default function Index() {
  const navigate = useNavigate();
  const { isAdmin, login } = useAdmin();
  const [showLogin, setShowLogin] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [loginLoading, setLoginLoading] = useState(false);

  const marmitaPrices = {
    pequena: 12.0,
    media: 15.0,
    grande: 18.0,
  };

  const handleMarmitaClick = (size: MarmitaSize) => {
    navigate(`/pedido?size=${size}`);
  };

  const foodPhotos = [
    {
      title: "Marmita Completa",
      description: "Arroz, feijão, carne e acompanhamentos frescos",
    },
    {
      title: "Ingredientes Frescos",
      description: "Sempre selecionados com qualidade e carinho",
    },
    {
      title: "Preparo Artesanal",
      description: "Feito com técnica tradicional e muito amor",
    },
    {
      title: "Embalagem Especial",
      description: "Mantemos o sabor e a temperatura perfeita",
    },
  ];

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % foodPhotos.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [foodPhotos.length]);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % foodPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + foodPhotos.length) % foodPhotos.length,
    );
  };

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoginLoading(true);
    const success = await login(loginForm.username, loginForm.password);

    if (success) {
      toast({
        title: "Login realizado",
        description: "Bem-vindo, administrador!",
      });
      setShowLogin(false);
      setLoginForm({ username: "", password: "" });
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    }
    setLoginLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-orange mr-2" />
              <span className="text-xl font-bold text-brown">
                Marmitaria do Sabor
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {isAdmin ? (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin/config")}
                    className="border-orange text-orange hover:bg-orange/10"
                  >
                    Cardápio
                  </Button>
                </div>
              ) : (
                <Dialog open={showLogin} onOpenChange={setShowLogin}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-orange transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Login Administrativo</DialogTitle>
                      <DialogDescription>
                        Acesso restrito para administradores.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Usuário</Label>
                        <Input
                          id="username"
                          value={loginForm.username}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              username: e.target.value,
                            })
                          }
                          placeholder="Digite seu usuário"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              password: e.target.value,
                            })
                          }
                          placeholder="Digite sua senha"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleLogin();
                            }
                          }}
                        />
                      </div>
                      <Button
                        onClick={handleLogin}
                        disabled={loginLoading}
                        className="w-full bg-orange hover:bg-orange-dark"
                      >
                        {loginLoading ? "Entrando..." : "Entrar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange/10 to-cream py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brown mb-6">
              Marmitas
              <span className="text-orange block">Deliciosas</span>
            </h1>
            <p className="text-xl text-brown-light mb-8 max-w-2xl mx-auto">
              Comida caseira feita com carinho, entregue fresquinha na sua casa.
              Escolha o tamanho ideal para seu apetite!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => handleMarmitaClick("media")}
                className="bg-orange hover:bg-orange-dark text-lg"
              >
                <UtensilsCrossed className="h-5 w-5 mr-2" />
                Fazer Pedido
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg border-orange text-orange hover:bg-orange/10"
              >
                <Phone className="h-5 w-5 mr-2" />
                (11) 99999-9999
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brown mb-4">
              Sobre Nossa Marmitaria
            </h2>
            <p className="text-brown-light text-lg max-w-3xl mx-auto">
              Há mais de 10 anos servindo refeições caseiras com o sabor da
              comida da vovó. Utilizamos apenas ingredientes frescos e
              selecionados, preparados diariamente com muito amor e dedicação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange" />
              </div>
              <h3 className="text-xl font-semibold text-brown mb-2">
                Entrega Rápida
              </h3>
              <p className="text-brown-light">
                Preparamos e entregamos sua marmita quentinha em até 45 minutos
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-orange" />
              </div>
              <h3 className="text-xl font-semibold text-brown mb-2">
                Feito com Amor
              </h3>
              <p className="text-brown-light">
                Cada marmita é preparada com carinho, como se fosse para nossa
                família
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange" />
              </div>
              <h3 className="text-xl font-semibold text-brown mb-2">
                Ingredientes Frescos
              </h3>
              <p className="text-brown-light">
                Sempre utilizamos ingredientes da melhor qualidade e procedência
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Food Photos Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brown mb-4">
              Nossa Comida
            </h2>
            <p className="text-brown-light text-lg">
              Veja como preparamos suas marmitas com carinho
            </p>
          </div>

          {/* Photo Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-lg bg-white shadow-xl">
              {/* Main Photo Display */}
              <div className="aspect-[16/9] bg-gradient-to-br from-orange/20 to-cream flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-20 w-20 text-orange/50 mx-auto mb-4" />
                    <Camera className="h-10 w-10 text-orange/30 mx-auto" />
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronLeft className="h-6 w-6 text-brown" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronRight className="h-6 w-6 text-brown" />
                </button>

                {/* Photo Counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1} / {foodPhotos.length}
                </div>
              </div>

              {/* Photo Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-brown mb-2">
                  {foodPhotos[currentPhotoIndex].title}
                </h3>
                <p className="text-brown-light">
                  {foodPhotos[currentPhotoIndex].description}
                </p>
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {foodPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPhoto(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentPhotoIndex
                      ? "bg-orange scale-125"
                      : "bg-orange/30 hover:bg-orange/50"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-brown-light text-sm">
              * Fotos ilustrativas. Sempre buscamos manter a qualidade e
              apresentação dos nossos pratos.
            </p>
          </div>
        </div>
      </section>

      {/* Marmita Options */}
      <section className="py-16 bg-cream/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brown mb-4">
              Escolha o Tamanho da Sua Marmita
            </h2>
            <p className="text-brown-light text-lg">
              Temos o tamanho perfeito para cada apetite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card
              className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              onClick={() => handleMarmitaClick("pequena")}
            >
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="h-10 w-10 text-orange" />
                </div>
                <CardTitle className="text-brown text-2xl">Pequena</CardTitle>
                <CardDescription className="text-brown-light">
                  Ideal para quem tem apetite leve
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-orange mb-4">
                  R$ {marmitaPrices.pequena.toFixed(2)}
                </div>
                <ul className="text-sm text-brown-light space-y-2 mb-6">
                  <li>• Arroz e feijão</li>
                  <li>• 1 tipo de carne</li>
                  <li>• 1 acompanhamento</li>
                  <li>• Porção individual</li>
                </ul>
                <Button
                  onClick={() => handleMarmitaClick("pequena")}
                  className="w-full bg-orange hover:bg-orange-dark"
                >
                  Escolher Pequena
                </Button>
              </CardContent>
            </Card>

            <Card
              className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 ring-2 ring-orange"
              onClick={() => handleMarmitaClick("media")}
            >
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="h-10 w-10 text-orange" />
                </div>
                <CardTitle className="text-brown text-2xl">
                  Média
                  <span className="ml-2 text-xs bg-orange text-white px-2 py-1 rounded-full">
                    POPULAR
                  </span>
                </CardTitle>
                <CardDescription className="text-brown-light">
                  Perfeita para a maioria das pessoas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-orange mb-4">
                  R$ {marmitaPrices.media.toFixed(2)}
                </div>
                <ul className="text-sm text-brown-light space-y-2 mb-6">
                  <li>• Arroz e feijão</li>
                  <li>• 2 tipos de carne</li>
                  <li>• 2 acompanhamentos</li>
                  <li>• Porção generosa</li>
                </ul>
                <Button
                  onClick={() => handleMarmitaClick("media")}
                  className="w-full bg-orange hover:bg-orange-dark"
                >
                  Escolher Média
                </Button>
              </CardContent>
            </Card>

            <Card
              className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              onClick={() => handleMarmitaClick("grande")}
            >
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="h-10 w-10 text-orange" />
                </div>
                <CardTitle className="text-brown text-2xl">Grande</CardTitle>
                <CardDescription className="text-brown-light">
                  Para quem tem um apetite especial
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-orange mb-4">
                  R$ {marmitaPrices.grande.toFixed(2)}
                </div>
                <ul className="text-sm text-brown-light space-y-2 mb-6">
                  <li>• Arroz e feijão</li>
                  <li>• 3 tipos de carne</li>
                  <li>• 3 acompanhamentos</li>
                  <li>• Porção extra grande</li>
                </ul>
                <Button
                  onClick={() => handleMarmitaClick("grande")}
                  className="w-full bg-orange hover:bg-orange-dark"
                >
                  Escolher Grande
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-brown text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Entre em Contato</h2>
          <p className="text-brown-light mb-8">
            Dúvidas? Sugestões? Estamos aqui para ajudar!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-orange" />
              <span>(11) 99999-9999</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-orange" />
              <span>Rua dos Sabores, 123 - Centro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brown-light text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-6 w-6 text-orange mr-2" />
            <span className="text-lg font-semibold">Marmitaria do Sabor</span>
          </div>
          <p className="text-sm">
            © 2024 Marmitaria do Sabor. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
