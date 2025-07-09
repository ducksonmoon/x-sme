import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Settings,
  Users,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import LoadingSpinner from "./LoadingSpinner";

// Validation schemas for each step
const businessInfoSchema = z.object({
  name: z
    .string()
    .min(2, "نام کسب‌وکار حداقل ۲ کاراکتر باشد")
    .max(100, "نام کسب‌وکار نباید بیش از ۱۰۰ کاراکتر باشد"),
  description: z
    .string()
    .max(500, "توضیحات نباید بیش از ۵۰۰ کاراکتر باشد")
    .optional(),
  phone: z.string().regex(/^(\+98|0)?9\d{9}$/, "شماره موبایل معتبر وارد کنید"),
  email: z.string().email("ایمیل معتبر وارد کنید"),
  address: z.string().max(300, "آدرس نباید بیش از ۳۰۰ کاراکتر باشد").optional(),
  website: z
    .string()
    .url("آدرس وب‌سایت معتبر وارد کنید")
    .optional()
    .or(z.literal("")),
});

const workingHoursSchema = z.object({
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "ساعت شروع معتبر وارد کنید"),
  endTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "ساعت پایان معتبر وارد کنید"),
  daysOfWeek: z.array(z.number()).min(1, "حداقل یک روز کاری انتخاب کنید"),
});

const paymentSettingsSchema = z.object({
  paymentRequired: z.boolean(),
  depositRequired: z.boolean(),
  depositPercentage: z.number().min(0).max(100).optional(),
  zarinpalMerchantId: z.string().optional(),
});

type BusinessInfoForm = z.infer<typeof businessInfoSchema>;
type WorkingHoursForm = z.infer<typeof workingHoursSchema>;
type PaymentSettingsForm = z.infer<typeof paymentSettingsSchema>;

interface BusinessOnboardingWizardProps {
  selectedPlan: {
    id: string;
    name: string;
    nameEn: string;
    setupFee: number;
    monthlyFee: number;
    yearlyFee: number;
  };
  billingCycle: "MONTHLY" | "YEARLY";
  onComplete: (data: {
    businessData: BusinessInfoForm;
    workingHours: WorkingHoursForm;
    paymentSettings: PaymentSettingsForm;
  }) => void;
  loading?: boolean;
}

const steps = [
  {
    id: 1,
    title: "اطلاعات کسب‌وکار",
    description: "اطلاعات پایه کسب‌وکار خود را وارد کنید",
    icon: Building2,
  },
  {
    id: 2,
    title: "ساعات کاری",
    description: "ساعات کاری و روزهای فعالیت را تنظیم کنید",
    icon: Clock,
  },
  {
    id: 3,
    title: "تنظیمات پرداخت",
    description: "درگاه‌های پرداخت و سیاست‌های مالی را تنظیم کنید",
    icon: CreditCard,
  },
  {
    id: 4,
    title: "بررسی نهایی",
    description: "اطلاعات وارد شده را بررسی و تایید کنید",
    icon: CheckCircle,
  },
];

const daysOfWeek = [
  { value: 6, label: "شنبه" },
  { value: 0, label: "یکشنبه" },
  { value: 1, label: "دوشنبه" },
  { value: 2, label: "سه‌شنبه" },
  { value: 3, label: "چهارشنبه" },
  { value: 4, label: "پنج‌شنبه" },
  { value: 5, label: "جمعه" },
];

const BusinessOnboardingWizard: React.FC<BusinessOnboardingWizardProps> = ({
  selectedPlan,
  billingCycle,
  onComplete,
  loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessInfoForm | null>(
    null
  );
  const [workingHoursData, setWorkingHoursData] =
    useState<WorkingHoursForm | null>(null);
  const [paymentSettingsData, setPaymentSettingsData] =
    useState<PaymentSettingsForm | null>(null);

  // Form instances for each step
  const businessForm = useForm<BusinessInfoForm>({
    resolver: zodResolver(businessInfoSchema),
    mode: "onTouched",
  });

  const workingHoursForm = useForm<WorkingHoursForm>({
    resolver: zodResolver(workingHoursSchema),
    mode: "onTouched",
    defaultValues: {
      startTime: "09:00",
      endTime: "18:00",
      daysOfWeek: [6, 0, 1, 2, 3, 4], // Saturday to Thursday
    },
  });

  const paymentForm = useForm<PaymentSettingsForm>({
    resolver: zodResolver(paymentSettingsSchema),
    mode: "onTouched",
    defaultValues: {
      paymentRequired: false,
      depositRequired: false,
      depositPercentage: 30,
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBusinessInfoSubmit = (data: BusinessInfoForm) => {
    setBusinessData(data);
    nextStep();
  };

  const handleWorkingHoursSubmit = (data: WorkingHoursForm) => {
    setWorkingHoursData(data);
    nextStep();
  };

  const handlePaymentSettingsSubmit = (data: PaymentSettingsForm) => {
    setPaymentSettingsData(data);
    nextStep();
  };

  const handleFinalSubmit = () => {
    if (businessData && workingHoursData && paymentSettingsData) {
      onComplete({
        businessData,
        workingHours: workingHoursData,
        paymentSettings: paymentSettingsData,
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === step.id
                ? "bg-primary-600 text-white"
                : currentStep > step.id
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            {currentStep > step.id ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-1 mx-2 ${
                currentStep > step.id
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                اطلاعات کسب‌وکار
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                اطلاعات پایه کسب‌وکار خود را وارد کنید
              </p>
            </div>

            <form
              onSubmit={businessForm.handleSubmit(handleBusinessInfoSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    نام کسب‌وکار *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      {...businessForm.register("name")}
                      placeholder="نام کسب‌وکار خود را وارد کنید"
                      className="pl-10"
                    />
                  </div>
                  {businessForm.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {businessForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    شماره تماس *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      {...businessForm.register("phone")}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className="pl-10"
                    />
                  </div>
                  {businessForm.formState.errors.phone && (
                    <p className="text-sm text-red-600">
                      {businessForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ایمیل *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...businessForm.register("email")}
                    type="email"
                    placeholder="info@business.com"
                    className="pl-10"
                  />
                </div>
                {businessForm.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {businessForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  توضیحات کسب‌وکار
                </label>
                <textarea
                  {...businessForm.register("description")}
                  rows={3}
                  placeholder="توضیح کوتاهی از کسب‌وکار خود بنویسید..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                />
                {businessForm.formState.errors.description && (
                  <p className="text-sm text-red-600">
                    {businessForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    آدرس
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      {...businessForm.register("address")}
                      placeholder="آدرس کسب‌وکار"
                      className="pl-10"
                    />
                  </div>
                  {businessForm.formState.errors.address && (
                    <p className="text-sm text-red-600">
                      {businessForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    وب‌سایت
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      {...businessForm.register("website")}
                      placeholder="https://website.com"
                      className="pl-10"
                    />
                  </div>
                  {businessForm.formState.errors.website && (
                    <p className="text-sm text-red-600">
                      {businessForm.formState.errors.website.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 space-x-reverse">
                <Button type="submit" size="lg">
                  مرحله بعد
                  <ChevronRight className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </form>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ساعات کاری
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                ساعات کاری و روزهای فعالیت کسب‌وکار خود را تنظیم کنید
              </p>
            </div>

            <form
              onSubmit={workingHoursForm.handleSubmit(handleWorkingHoursSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ساعت شروع *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      {...workingHoursForm.register("startTime")}
                      type="time"
                      className="pl-10"
                    />
                  </div>
                  {workingHoursForm.formState.errors.startTime && (
                    <p className="text-sm text-red-600">
                      {workingHoursForm.formState.errors.startTime.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ساعت پایان *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      {...workingHoursForm.register("endTime")}
                      type="time"
                      className="pl-10"
                    />
                  </div>
                  {workingHoursForm.formState.errors.endTime && (
                    <p className="text-sm text-red-600">
                      {workingHoursForm.formState.errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  روزهای کاری *
                </label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => {
                    const selectedDays =
                      workingHoursForm.watch("daysOfWeek") || [];
                    const isSelected = selectedDays.includes(day.value);

                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const currentDays =
                            workingHoursForm.getValues("daysOfWeek") || [];
                          const newDays = isSelected
                            ? currentDays.filter((d) => d !== day.value)
                            : [...currentDays, day.value];
                          workingHoursForm.setValue("daysOfWeek", newDays);
                        }}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          isSelected
                            ? "bg-primary-600 text-white border-primary-600"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-300"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {workingHoursForm.formState.errors.daysOfWeek && (
                  <p className="text-sm text-red-600">
                    {workingHoursForm.formState.errors.daysOfWeek.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 ml-2" />
                  مرحله قبل
                </Button>
                <Button type="submit" size="lg">
                  مرحله بعد
                  <ChevronRight className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </form>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                تنظیمات پرداخت
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                درگاه‌های پرداخت و سیاست‌های مالی را تنظیم کنید
              </p>
            </div>

            <form
              onSubmit={paymentForm.handleSubmit(handlePaymentSettingsSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      پرداخت آنلاین
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      آیا مشتریان باید هنگام رزرو پرداخت کنند؟
                    </p>
                  </div>
                  <input
                    {...paymentForm.register("paymentRequired")}
                    type="checkbox"
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      پیش‌پرداخت
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      آیا بخشی از مبلغ به عنوان پیش‌پرداخت دریافت شود؟
                    </p>
                  </div>
                  <input
                    {...paymentForm.register("depositRequired")}
                    type="checkbox"
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>

                {paymentForm.watch("depositRequired") && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      درصد پیش‌پرداخت
                    </label>
                    <div className="relative">
                      <Input
                        {...paymentForm.register("depositPercentage", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="10"
                        max="100"
                        placeholder="30"
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        %
                      </span>
                    </div>
                    {paymentForm.formState.errors.depositPercentage && (
                      <p className="text-sm text-red-600">
                        {paymentForm.formState.errors.depositPercentage.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    شناسه درگاه زرین‌پال (اختیاری)
                  </label>
                  <Input
                    {...paymentForm.register("zarinpalMerchantId")}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    در صورت نداشتن، می‌توانید بعداً از پنل تنظیم کنید
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 ml-2" />
                  مرحله قبل
                </Button>
                <Button type="submit" size="lg">
                  مرحله بعد
                  <ChevronRight className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </form>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                بررسی نهایی
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                اطلاعات وارد شده را بررسی و تایید کنید
              </p>
            </div>

            <div className="space-y-6">
              {/* Plan Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">پلن انتخابی</Badge>
                    {selectedPlan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        هزینه راه‌اندازی:
                      </span>
                      <span className="font-medium mr-2">
                        {selectedPlan.setupFee.toLocaleString()} تومان
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        هزینه دوره‌ای:
                      </span>
                      <span className="font-medium mr-2">
                        {billingCycle === "MONTHLY"
                          ? `${selectedPlan.monthlyFee.toLocaleString()} تومان/ماه`
                          : `${selectedPlan.yearlyFee.toLocaleString()} تومان/سال`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Info Summary */}
              {businessData && (
                <Card>
                  <CardHeader>
                    <CardTitle>اطلاعات کسب‌وکار</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          نام:
                        </span>
                        <span className="font-medium mr-2">
                          {businessData.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          تلفن:
                        </span>
                        <span className="font-medium mr-2">
                          {businessData.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          ایمیل:
                        </span>
                        <span className="font-medium mr-2">
                          {businessData.email}
                        </span>
                      </div>
                      {businessData.website && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            وب‌سایت:
                          </span>
                          <span className="font-medium mr-2">
                            {businessData.website}
                          </span>
                        </div>
                      )}
                    </div>
                    {businessData.description && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          توضیحات:
                        </span>
                        <p className="text-sm mt-1">
                          {businessData.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Working Hours Summary */}
              {workingHoursData && (
                <Card>
                  <CardHeader>
                    <CardTitle>ساعات کاری</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          ساعات:
                        </span>
                        <span className="font-medium mr-2">
                          {workingHoursData.startTime} تا{" "}
                          {workingHoursData.endTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          روزهای کاری:
                        </span>
                        <span className="font-medium mr-2">
                          {workingHoursData.daysOfWeek
                            .map(
                              (day) =>
                                daysOfWeek.find((d) => d.value === day)?.label
                            )
                            .join("، ")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 ml-2" />
                مرحله قبل
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={loading}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    در حال ایجاد...
                  </div>
                ) : (
                  <>
                    ایجاد کسب‌وکار
                    <CheckCircle className="w-4 h-4 mr-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {renderStepIndicator()}

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </div>
    </div>
  );
};

export default BusinessOnboardingWizard;
