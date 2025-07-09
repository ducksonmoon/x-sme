import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useLanguage } from "@/providers/LanguageProvider";
import { authApi } from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwords_not_match"));
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authApi.register(registerData);

      if (response.data.success) {
        // Set the token in axios headers
        const { default: axios } = await import("axios");
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.token}`;

        login(response.data.user, response.data.token);

        // Redirect based on user role
        if (response.data.user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t("auth.registration_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("auth.create_account")}
        </h1>
        <p className="text-gray-600">{t("auth.join_xsme")}</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("auth.first_name")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t("auth.enter_first_name")}
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("auth.last_name")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t("auth.enter_last_name")}
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("auth.email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("auth.enter_email")}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("auth.phone_optional")}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("auth.enter_phone")}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("auth.password")}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("auth.enter_password")}
              className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("auth.confirm_password")}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t("auth.enter_confirm_password")}
              className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
            />
          </div>
          <div className="mr-3 text-sm">
            <label htmlFor="terms" className="text-gray-700">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">{t("auth.creating_account")}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <UserPlus className="w-4 h-4 mr-2" />
              <span>{t("auth.sign_up")}</span>
            </div>
          )}
        </Button>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("auth.already_have_account")}{" "}
            <Link
              to="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {t("auth.sign_in_here")}
            </Link>
          </p>
        </div>
      </motion.form>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
      >
        <h3 className="text-sm font-medium text-green-900 mb-3 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          مزایای عضویت در X-SME
        </h3>
        <div className="text-sm text-green-700 space-y-2">
          <p>• ۱۴ روز آزمایشی رایگان</p>
          <p>• بدون نیاز به کارت اعتباری برای شروع</p>
          <p>• پشتیبانی ۲۴/۷ به زبان فارسی</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
