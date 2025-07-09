import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/providers/LanguageProvider";
import { authApi } from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, ArrowLeft, AlertCircle, Send } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.forgotPassword(email);

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "خطا در ارسال لینک بازنشانی. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full text-center"
      >
        {/* Success Message */}
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t("auth.reset_link_sent")}
          </h1>
          <p className="text-gray-600 text-lg">{t("auth.check_email")}</p>
        </div>

        {/* Info Card */}
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl mb-8">
          <p className="text-sm text-blue-700">
            لینک بازنشانی رمز عبور به ایمیل <strong>{email}</strong> ارسال شد.
            در صورت عدم دریافت، پوشه spam خود را بررسی کنید.
          </p>
        </div>

        {/* Back to Login */}
        <Button
          asChild
          variant="outline"
          className="px-6 h-12 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        >
          <Link to="/auth/login" className="inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("auth.back_to_login")}
          </Link>
        </Button>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("auth.reset_password_title")}
        </h1>
        <p className="text-gray-600">{t("auth.reset_password_description")}</p>
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

        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("auth.email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.enter_email")}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          <p className="text-sm text-gray-500">
            لینک بازنشانی رمز عبور به این ایمیل ارسال خواهد شد
          </p>
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
              <span className="ml-2">{t("auth.sending_reset_link")}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Send className="w-4 h-4 mr-2" />
              <span>{t("auth.send_reset_link")}</span>
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
            {t("auth.back_to_login")}
          </Link>
        </div>
      </motion.form>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-xl"
      >
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          نیاز به کمک دارید؟
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          اگر مشکلی در بازیابی حساب کاربری خود دارید، با تیم پشتیبانی ما تماس
          بگیرید.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/contact">تماس با پشتیبانی</Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/auth/register">ایجاد حساب جدید</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
