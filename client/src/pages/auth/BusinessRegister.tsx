import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/api";
import PlanSelector from "@/components/PlanSelector";
import BusinessOnboardingWizard from "@/components/BusinessOnboardingWizard";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  User,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building,
  CreditCard,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Registration step enum
type RegistrationStep =
  | "user-info"
  | "plan-selection"
  | "business-setup"
  | "completion";

// User registration schema
const userRegistrationSchema = z
  .object({
    firstName: z.string().min(2, "نام حداقل ۲ کاراکتر باشد"),
    lastName: z.string().min(2, "نام خانوادگی حداقل ۲ کاراکتر باشد"),
    email: z.string().email("ایمیل معتبر وارد کنید"),
    phone: z
      .string()
      .regex(/^(\+98|0)?9\d{9}$/, "شماره موبایل معتبر وارد کنید")
      .optional(),
    password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تایید آن باید یکسان باشند",
    path: ["confirmPassword"],
  });

type UserRegistrationForm = z.infer<typeof userRegistrationSchema>;

interface Plan {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  setupFee: number;
  monthlyFee: number;
  yearlyFee: number;
  commissionRate: number;
  bookingsLimit: number | null;
  servicesLimit: number | null;
  smsLimit: number | null;
  features: string[];
  sortOrder: number;
}

const BusinessRegister: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // State management
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("user-info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [userData, setUserData] = useState<UserRegistrationForm | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">(
    "MONTHLY"
  );
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // User registration form
  const userForm = useForm<UserRegistrationForm>({
    resolver: zodResolver(userRegistrationSchema),
    mode: "onTouched",
  });

  // Step indicators
  const steps = [
    { key: "user-info", label: "ثبت‌نام", icon: User },
    { key: "plan-selection", label: "انتخاب پلن", icon: CreditCard },
    { key: "business-setup", label: "تنظیمات", icon: Building },
    { key: "completion", label: "تکمیل", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  // Step 1: User Registration
  const handleUserRegistration = async (data: UserRegistrationForm) => {
    try {
      setLoading(true);
      setError("");

      // Register user
      const { confirmPassword, ...registerData } = data;
      const requestData: any = {
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      };

      if (registerData.phone) {
        requestData.phone = registerData.phone;
      }

      const response = await authApi.register(requestData);

      if (response.data.success) {
        // Store auth data
        const { default: axios } = await import("axios");
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.token}`;
        login(response.data.user, response.data.token);

        // Store user data and move to plan selection
        setUserData(data);
        setCurrentStep("plan-selection");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "ثبت‌نام ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Plan Selection
  const handlePlanSelection = (plan: Plan, cycle: "MONTHLY" | "YEARLY") => {
    setSelectedPlan(plan);
    setBillingCycle(cycle);
    setCurrentStep("business-setup");
  };

  // Step 3: Business Setup
  const handleBusinessSetup = async (businessData: {
    businessData: any;
    workingHours: any;
    paymentSettings: any;
  }) => {
    try {
      setLoading(true);
      setError("");

      // Create subscription with business
      const subscriptionPayload = {
        planId: selectedPlan!.id,
        billingCycle,
        businessData: businessData.businessData,
        workingHours: businessData.workingHours,
        paymentSettings: businessData.paymentSettings,
      };

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(subscriptionPayload),
      });

      const result = await response.json();

      if (result.success) {
        setSubscriptionData(result.data);
        setCurrentStep("completion");
      } else {
        throw new Error(result.error || "خطا در ایجاد اشتراک");
      }
    } catch (err: any) {
      setError(err.message || "خطا در ایجاد کسب‌وکار");
    } finally {
      setLoading(false);
    }
  };

  // Navigation helpers
  const goBack = () => {
    switch (currentStep) {
      case "plan-selection":
        setCurrentStep("user-info");
        break;
      case "business-setup":
        setCurrentStep("plan-selection");
        break;
      default:
        navigate("/auth/login");
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "user-info":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                شروع کسب‌وکار دیجیتال
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                اطلاعات شخصی خود را برای ایجاد حساب کاربری وارد کنید
              </p>
            </div>

            {/* Form Card */}
            <Card className="border-0 shadow-2xl shadow-blue-500/10">
              <CardContent className="p-6 md:p-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </motion.div>
                )}

                <form
                  onSubmit={userForm.handleSubmit(handleUserRegistration)}
                  className="space-y-6"
                >
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        نام *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...userForm.register("firstName")}
                          placeholder="نام"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                      {userForm.formState.errors.firstName && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        نام خانوادگی *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...userForm.register("lastName")}
                          placeholder="نام خانوادگی"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                      {userForm.formState.errors.lastName && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      ایمیل *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...userForm.register("email")}
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                    {userForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {userForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      شماره موبایل (اختیاری)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...userForm.register("phone")}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                    {userForm.formState.errors.phone && (
                      <p className="text-sm text-red-600">
                        {userForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      رمز عبور *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...userForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="حداقل ۶ کاراکتر"
                        className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                    {userForm.formState.errors.password && (
                      <p className="text-sm text-red-600">
                        {userForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      تایید رمز عبور *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...userForm.register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="رمز عبور را مجدداً وارد کنید"
                        className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {userForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">
                        {userForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        در حال ثبت‌نام...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>ادامه</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    قبلاً حساب دارید؟{" "}
                    <button
                      onClick={() => navigate("/auth/login")}
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      وارد شوید
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "plan-selection":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                انتخاب پلن مناسب
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                بهترین پلن را برای نیازهای کسب‌وکار خود انتخاب کنید
              </p>

              {/* Welcome Message */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full mb-6">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">
                  خوش آمدید، {userData?.firstName}! ✨
                </span>
              </div>
            </div>

            <PlanSelector
              onPlanSelect={handlePlanSelection}
              loading={loading}
            />
          </motion.div>
        );

      case "business-setup":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                تنظیمات کسب‌وکار
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                اطلاعات کسب‌وکار و تنظیمات اولیه را کامل کنید
              </p>

              {/* Selected Plan Info */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full mb-6">
                <Zap className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">
                  پلن انتخابی: {selectedPlan?.name}
                </span>
              </div>
            </div>

            <BusinessOnboardingWizard
              selectedPlan={{
                id: selectedPlan!.id,
                name: selectedPlan!.name,
                nameEn: selectedPlan!.nameEn,
                setupFee: selectedPlan!.setupFee,
                monthlyFee: selectedPlan!.monthlyFee,
                yearlyFee: selectedPlan!.yearlyFee,
              }}
              billingCycle={billingCycle}
              onComplete={handleBusinessSetup}
              loading={loading}
            />
          </motion.div>
        );

      case "completion":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto text-center"
          >
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-green-500/25"
            >
              <CheckCircle className="w-16 h-16 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              🎉 تبریک!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
            >
              کسب‌وکار شما با موفقیت ایجاد شد و آماده استفاده است. اکنون
              می‌توانید شروع به مدیریت رزروها و درآمدزایی کنید.
            </motion.p>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">دوره آزمایشی</h3>
                  <p className="text-sm text-gray-600">
                    ۱۴ روز رایگان برای آزمایش همه قابلیت‌ها
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Building className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">آماده استفاده</h3>
                  <p className="text-sm text-gray-600">
                    پنل مدیریت و ویجت رزرو آماده استفاده است
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">پشتیبانی کامل</h3>
                  <p className="text-sm text-gray-600">
                    راهنمایی و پشتیبانی ۲۴/۷ در دسترس شماست
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Subscription Summary */}
            {subscriptionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <Card className="border-0 shadow-lg mb-8">
                  <CardHeader>
                    <CardTitle className="text-center">خلاصه اشتراک</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          پلن انتخابی
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedPlan?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">وضعیت</p>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          آزمایشی
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="space-y-4"
            >
              <Button
                onClick={goToDashboard}
                size="lg"
                className="h-14 px-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                ورود به پنل مدیریت
              </Button>

              <p className="text-sm text-gray-500 max-w-md mx-auto">
                می‌توانید همین الان شروع به اضافه کردن خدمات، تنظیم زمان‌بندی و
                مدیریت رزروهای مشتریان خود کنید.
              </p>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Progress */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 overflow-hidden">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center py-2.5 min-w-0">
            {/* Back Button */}
            <div className="flex items-center min-w-0 w-20">
              {currentStep !== "completion" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">بازگشت</span>
                </Button>
              )}
            </div>

            {/* Progress Steps - Center */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              {/* Desktop Progress */}
              <div className="hidden xl:flex items-center gap-1">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="flex items-center">
                      <div
                        className={`
                        flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300
                        ${
                          isCompleted
                            ? "bg-blue-600 border-blue-600 text-white"
                            : isCurrent
                              ? "border-blue-600 text-blue-600 bg-blue-50"
                              : "border-gray-300 text-gray-400"
                        }
                      `}
                      >
                        <StepIcon className="w-3 h-3" />
                      </div>
                      <span
                        className={`
                        mr-1 text-xs font-medium whitespace-nowrap
                        ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"}
                      `}
                      >
                        {step.label}
                      </span>
                      {index < steps.length - 1 && (
                        <div
                          className={`
                          w-2 h-px mx-1
                          ${isCompleted ? "bg-blue-600" : "bg-gray-300"}
                          transition-colors duration-300
                        `}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tablet Progress (icons only) */}
              <div className="hidden lg:flex xl:hidden items-center gap-1.5">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="flex items-center">
                      <div
                        className={`
                        flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300
                        ${
                          isCompleted
                            ? "bg-blue-600 border-blue-600 text-white"
                            : isCurrent
                              ? "border-blue-600 text-blue-600 bg-blue-50"
                              : "border-gray-300 text-gray-400"
                        }
                      `}
                      >
                        <StepIcon className="w-2.5 h-2.5" />
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`
                          w-1.5 h-px mx-1
                          ${isCompleted ? "bg-blue-600" : "bg-gray-300"}
                          transition-colors duration-300
                        `}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile Progress */}
              <div className="lg:hidden flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`
                        w-1.5 h-1.5 rounded-full transition-colors duration-300
                        ${index <= currentStepIndex ? "bg-blue-600" : "bg-gray-300"}
                      `}
                    />
                  ))}
                </div>
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 whitespace-nowrap"
                >
                  {currentStepIndex + 1}/{steps.length}
                </Badge>
              </div>
            </div>

            {/* Right Spacer */}
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </div>
    </div>
  );
};

export default BusinessRegister;
