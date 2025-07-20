import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import LoadingSpinner from "@components/LoadingSpinner";
import ProtectedRoute from "@components/ProtectedRoute";
import MainLayout from "@layouts/MainLayout";
import AuthLayout from "@layouts/AuthLayout";
import DashboardLayout from "@layouts/DashboardLayout";
import { useAuthStore } from "@store/authStore";
import { BusinessProvider } from "./contexts/BusinessContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Lazy load pages for better performance
const Home = React.lazy(() => import("@pages/Home"));
const About = React.lazy(() => import("@pages/About"));
const Contact = React.lazy(() => import("@pages/Contact"));
const Pricing = React.lazy(() => import("@pages/Pricing"));
const Features = React.lazy(() => import("@pages/Features"));

// Auth pages
const Login = React.lazy(() => import("@pages/auth/Login"));
const StaffLogin = React.lazy(() => import("@pages/auth/StaffLogin"));
const Register = React.lazy(() => import("@pages/auth/Register"));
const BusinessRegister = React.lazy(
  () => import("@pages/auth/BusinessRegister")
);
const ForgotPassword = React.lazy(() => import("@pages/auth/ForgotPassword"));
const ResetPassword = React.lazy(() => import("@pages/auth/ResetPassword"));

// Dashboard pages
const Dashboard = React.lazy(() => import("@pages/dashboard/Dashboard"));
const Bookings = React.lazy(() => import("@pages/dashboard/Bookings"));
const Services = React.lazy(() => import("@pages/dashboard/Services"));
const Staff = React.lazy(() => import("@pages/dashboard/Staff"));
const TimeSlots = React.lazy(() => import("@pages/dashboard/TimeSlots"));
const Analytics = React.lazy(() => import("@pages/dashboard/Analytics"));
const Domains = React.lazy(() => import("@pages/dashboard/Domains"));
const Settings = React.lazy(() => import("@pages/dashboard/Settings"));
const Profile = React.lazy(() => import("@pages/dashboard/Profile"));
const PaymentPage = React.lazy(() => import("@pages/dashboard/PaymentPage"));
const PaymentCallback = React.lazy(
  () => import("@pages/dashboard/PaymentCallback")
);

// Admin pages
const AdminDashboard = React.lazy(() => import("@pages/admin/Dashboard"));
const AdminBusinesses = React.lazy(() => import("@pages/admin/Businesses"));
const AdminUsers = React.lazy(() => import("@pages/admin/Users"));
const AdminAnalytics = React.lazy(() => import("@pages/admin/Analytics"));
const BusinessDetails = React.lazy(
  () => import("@pages/admin/BusinessDetails")
);
const AdminBusinessDashboard = React.lazy(
  () => import("@pages/dashboard/Dashboard")
);

// Widget pages
const WidgetDemo = React.lazy(() => import("@pages/WidgetDemo"));
const WidgetDocs = React.lazy(() => import("@pages/WidgetDocs"));
const Widget = React.lazy(() => import("@pages/Widget"));
const WidgetPreview = React.lazy(() => import("@pages/WidgetPreview"));
const HostedWidget = React.lazy(() => import("@pages/HostedWidget"));

// Error pages
const NotFound = React.lazy(() => import("@pages/NotFound"));
const ServerError = React.lazy(() => import("@pages/ServerError"));

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Helmet>
        <title>X-SME - Booking & Payment Widget</title>
        <meta
          name="description"
          content="Localized Booking & Payment Widget for Iranian SMEs"
        />
      </Helmet>

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="features" element={<Features />} />
            <Route path="widget-demo" element={<WidgetDemo />} />
            <Route path="widget-docs" element={<WidgetDocs />} />
          </Route>

          {/* Widget routes (no layout) */}
          <Route path="/widget" element={<Widget />} />
          <Route path="/widget-preview" element={<WidgetPreview />} />
          <Route path="/w/:businessId" element={<HostedWidget />} />

          {/* Auth routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="staff-login" element={<StaffLogin />} />
            <Route path="register" element={<Register />} />
            <Route path="business-register" element={<BusinessRegister />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <NotificationProvider>
                  <DashboardLayout />
                </NotificationProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="bookings"
              element={
                <ProtectedRoute
                  requiredPermission={{ page: "bookings", action: "VIEW" }}
                >
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="services"
              element={
                <ProtectedRoute
                  requiredPermission={{ page: "services", action: "VIEW" }}
                >
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute
                  requiredPermission={{ page: "staff", action: "VIEW" }}
                >
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="timeslots"
              element={
                <ProtectedRoute
                  requiredPermission={{ page: "timeslots", action: "VIEW" }}
                >
                  <TimeSlots />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute
                  requiredPermission={{ page: "analytics", action: "VIEW" }}
                >
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="domains"
              element={
                <ProtectedRoute
                  requiredPermission={{ page: "domains", action: "VIEW" }}
                >
                  <Domains />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute
                  requiredPermission={{ page: "settings", action: "VIEW" }}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute
                  requiredPermission={{ page: "profile", action: "VIEW" }}
                >
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="payment/callback" element={<PaymentCallback />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <NotificationProvider>
                  <DashboardLayout />
                </NotificationProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="businesses/:id" element={<BusinessDetails />} />
            <Route
              path="business-dashboard"
              element={
                <BusinessProvider initialBusinessId={null}>
                  <AdminBusinessDashboard />
                </BusinessProvider>
              }
            />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Error routes */}
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
