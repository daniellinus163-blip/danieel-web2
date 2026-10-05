import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LandingPage from '@/pages/LandingPage'
import SignupPage from '@/pages/auth/SignupPage'
import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import SetupPage from '@/pages/SetupPage'
import TestPage from '@/pages/TestPage'
import MemberDashboard from '@/pages/member/MemberDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import MemberManagementPage from '@/pages/admin/MemberManagementPage'
import SuperAdminDashboard from '@/pages/super-admin/SuperAdminDashboard'
import RoleRequestsPage from '@/pages/super-admin/RoleRequestsPage'
import ImagePolicySettings from '@/pages/super-admin/ImagePolicySettings'
import SettingsProfilePage from '@/pages/SettingsProfilePage'
import UserManagementPage from '@/pages/super-admin/UserManagementPage'
import AuditLogsPage from '@/pages/super-admin/AuditLogsPage'
import ShopPage from '@/pages/ShopPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CartPage from '@/pages/CartPage'
import WishlistPage from '@/pages/WishlistPage'
import CheckoutPage from '@/pages/CheckoutPage'
import ProfilePage from '@/pages/ProfilePage'
import CommunityPage from '@/pages/CommunityPage'
import OrdersPage from '@/pages/OrdersPage'
import CategoryPage from '@/pages/CategoryPage'
import CollectionPage from '@/pages/CollectionPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/test" element={<TestPage />} />
          
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SettingsProfilePage />} />
          </Route>
          
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute allowedRoles={['member', 'admin', 'super_admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberDashboard />} />
          </Route>

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<MemberManagementPage />} />
          </Route>

          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="policies" element={<ImagePolicySettings />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="role-requests" element={<RoleRequestsPage />} />
          </Route>

          <Route path="/access-denied" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Access Denied</h1><p className="mt-2">You don't have permission to access this page.</p></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
