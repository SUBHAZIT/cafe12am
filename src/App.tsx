import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CustomerLogin from "@/components/auth/CustomerLogin";
import StaffLogin from "@/components/auth/StaffLogin";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CustomerMenu from "@/pages/CustomerMenu";
import CustomerOrders from "@/pages/CustomerOrders";
import CartPage from "@/pages/CartPage";
import AdminPanel from "@/pages/AdminPanel";
import MerchantDashboard from "@/pages/MerchantDashboard";
import DeliveryPartnerApp from "@/pages/DeliveryPartnerApp";
import CustomerProfile from "@/pages/CustomerProfile";
import MerchantProfile from "@/pages/MerchantProfile";
import DeliveryProfile from "@/pages/DeliveryProfile";
import AdminProfile from "@/pages/AdminProfile";

const queryClient = new QueryClient();

const RoleRedirector = () => {
  const { user, primaryRole, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  
  switch (primaryRole) {
    case "admin": return <Navigate to="/admin" replace />;
    case "merchant": return <Navigate to="/merchant" replace />;
    case "delivery_partner": return <Navigate to="/delivery" replace />;
    default: return <Navigate to="/order" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/merchant/login" element={<StaffLogin type="merchant" />} />
            <Route path="/delivery/login" element={<StaffLogin type="delivery" />} />
            <Route path="/admin/login" element={<StaffLogin type="admin" />} />
            <Route path="/dashboard" element={<RoleRedirector />} />

            {/* Customer */}
            <Route path="/order" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerMenu /></ProtectedRoute>} />
            <Route path="/order/orders" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerOrders /></ProtectedRoute>} />
            <Route path="/order/profile" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerProfile /></ProtectedRoute>} />
            <Route path="/order/cart" element={<CartPage />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProfile /></ProtectedRoute>} />

            {/* Merchant */}
            <Route path="/merchant" element={<ProtectedRoute allowedRoles={["merchant"]}><MerchantDashboard /></ProtectedRoute>} />
            <Route path="/merchant/profile" element={<ProtectedRoute allowedRoles={["merchant"]}><MerchantProfile /></ProtectedRoute>} />

            {/* Delivery Partner */}
            <Route path="/delivery" element={<ProtectedRoute allowedRoles={["delivery_partner"]}><DeliveryPartnerApp /></ProtectedRoute>} />
            <Route path="/delivery/profile" element={<ProtectedRoute allowedRoles={["delivery_partner"]}><DeliveryProfile /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
