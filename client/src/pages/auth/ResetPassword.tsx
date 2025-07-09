import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/providers/LanguageProvider";
import { authApi } from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Shield,
} from "lucide-react";

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const token = searchParams.get("token");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("رمز عبور و تایید آن باید یکسان باشند");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("رمز عبور حداقل باید ۶ کاراکتر باشد");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.resetPassword(
        token || "",
        formData.password
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "خطا در بازنشانی رمز عبور. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if token exists
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full text-center"
      >
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            لینک نامعتبر
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            لینک بازنشانی رمز عبور نامعتبر یا منقضی شده است.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Link to="/auth/forgot-password">درخواست لینک جدید</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
          >
            <Link to="/auth/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              بازگشت به ورود
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full text-center"
      >
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            رمز عبور بازنشانی شد
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            رمز عبور شما با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...
          </p>
        </div>

        <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-700">
            اکنون می‌توانید با رمز عبور جدید وارد حساب کاربری خود شوید.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          تنظیم رمز عبور جدید
        </h1>
        <p className="text-gray-600">رمز عبور جدید خود را وارد کنید</p>
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

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            رمز عبور جدید
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="حداقل ۶ کاراکتر"
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
            تایید رمز عبور
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="رمز عبور را مجدداً وارد کنید"
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

        {/* Password Requirements */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            الزامات رمز عبور:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li
              className={`flex items-center ${formData.password.length >= 6 ? "text-green-600" : ""}`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
              حداقل ۶ کاراکتر
            </li>
            <li
              className={`flex items-center ${formData.password === formData.confirmPassword && formData.confirmPassword ? "text-green-600" : ""}`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${formData.password === formData.confirmPassword && formData.confirmPassword ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
              تطابق تایید رمز عبور
            </li>
          </ul>
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
              <span className="ml-2">در حال بازنشانی...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Shield className="w-4 h-4 mr-2" />
              <span>بازنشانی رمز عبور</span>
            </div>
          )}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            بازگشت به ورود
          </Link>
        </div>
      </motion.form>
    </div>
  );
};

export default ResetPassword;
