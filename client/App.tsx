import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pedido from "./pages/Pedido";
import AdminPedidos from "./pages/AdminPedidos";
import AdminFinancas from "./pages/AdminFinancas";
import AdminConfig from "./pages/AdminConfig";
import NotFound from "./pages/NotFound";
import { AdminProvider } from "@/contexts/AdminContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pedido" element={<Pedido />} />
            <Route path="/admin/pedidos" element={<AdminPedidos />} />
            <Route path="/admin/financas" element={<AdminFinancas />} />
            <Route path="/admin/config" element={<AdminConfig />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AdminProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
