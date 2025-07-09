import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Book,
  Code,
  Copy,
  Check,
  Play,
  Settings,
  Zap,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Search,
  Download,
  Globe,
  Smartphone,
  Monitor,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Input } from "@components/ui/input";

const WidgetDocs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const CodeBlock = ({
    code,
    language = "html",
    title,
    id,
  }: {
    code: string;
    language?: string;
    title?: string;
    id: string;
  }) => (
    <div className="relative">
      {title && (
        <div className="bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-400 text-xs ml-3">{title}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className={`h-6 px-2 text-xs ${
                copiedCode === id
                  ? "text-green-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => copyCode(code, id)}
            >
              {copiedCode === id ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )}
      <pre
        className={`bg-gray-900 text-gray-100 p-4 ${
          title ? "rounded-b-lg" : "rounded-lg"
        } text-sm overflow-x-auto border border-gray-300 font-mono`}
        dir="ltr"
        style={{
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "embed",
        }}
      >
        <code className={`language-${language}`} dir="ltr">
          {code}
        </code>
      </pre>
    </div>
  );

  // Navigation sections
  const sections = [
    { id: "getting-started", title: "شروع سریع (همه‌جا)", icon: Zap },
    { id: "wordpress-guide", title: "WordPress (راحت‌تر)", icon: Globe },
    { id: "configuration", title: "تنظیمات", icon: Settings },
    { id: "events", title: "رویدادها", icon: Code },
    { id: "examples", title: "نمونه‌های پلتفرم", icon: Play },
    { id: "best-practices", title: "بهترین روش‌ها", icon: CheckCircle },
    { id: "troubleshooting", title: "عیب‌یابی", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                <Book className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              مستندات ویجت X-SME
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              راهنمای کامل نصب، پیکربندی و استفاده از ویجت رزرو هوشمند
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="جستجو در مستندات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 sticky top-8 h-fit">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">فهرست مطالب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => (
                  <motion.a
                    key={section.id}
                    href={`#${section.id}`}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors group"
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="font-medium">{section.title}</span>
                    <ChevronRight className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                ))}

                <div className="border-t pt-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a href="/widget-demo" target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      مشاهده دمو زنده
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-12">
            {/* Getting Started */}
            <section id="getting-started">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          شروع سریع - هر وب‌سایت
                        </CardTitle>
                        <CardDescription>
                          ویجت در هر پلتفرمی کار می‌کند - فقط ۲ خط کد!
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Universal Compatibility Notice */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-bold text-blue-800">
                          کار در همه‌جا!
                        </h4>
                      </div>
                      <p className="text-blue-700 text-sm">
                        این روش در <strong>هر وب‌سایت و پلتفرمی</strong> کار
                        می‌کند: HTML، React، Vue، Angular، Drupal، Joomla،
                        WordPress، Shopify و...
                      </p>
                    </div>

                    <div className="grid gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            1
                          </span>
                          اضافه کردن اسکریپت
                        </h3>
                        <p className="text-gray-600 mb-4">
                          اسکریپت ویجت را قبل از تگ <code>&lt;/body&gt;</code>{" "}
                          اضافه کنید:
                        </p>
                        <CodeBlock
                          id="step1"
                          title="index.html"
                          code={`<script src="https://widget.x-sme.ir/widget.js"></script>`}
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            2
                          </span>
                          اضافه کردن ویجت
                        </h3>
                        <p className="text-gray-600 mb-4">
                          کانتینر ویجت را در محل دلخواه قرار دهید:
                        </p>
                        <CodeBlock
                          id="step2"
                          title="widget-container.html"
                          code={`<div id="xsme-booking-widget" 
     data-business-id="your-business-id">
</div>`}
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            ✓
                          </span>
                          تمام!
                        </h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                              <p className="font-semibold text-green-800">
                                ویجت آماده است!
                              </p>
                              <p className="text-green-700 text-sm">
                                مشتریان حالا در هر سایتی می‌توانند رزرو کنند
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Platform Examples */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">
                          ✨ مثال‌های استفاده در پلتفرم‌های مختلف:
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>WordPress:</strong> همین کد + پلاگین
                              راحت‌تر
                            </p>
                            <p>
                              <strong>React/Vue:</strong> در هر component
                            </p>
                            <p>
                              <strong>HTML ساده:</strong> در هر صفحه
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Drupal/Joomla:</strong> در محتوا یا قالب
                            </p>
                            <p>
                              <strong>Shopify:</strong> در صفحات محصول
                            </p>
                            <p>
                              <strong>سایر پلتفرم‌ها:</strong> همین روش
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* WordPress Guide - Special section for non-technical users */}
            <section id="wordpress-guide">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          WordPress - راه آسان‌تر!
                        </CardTitle>
                        <CardDescription>
                          پلاگین و shortcode برای راحتی بیشتر (اختیاری)
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-green-100 text-green-800 border-0">
                        ✅ فقط کپی و پیست
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-0">
                        🚀 ۳ دقیقه
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Important Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            !
                          </span>
                        </div>
                        <h4 className="font-semibold text-yellow-800">
                          مهم: سه راه برای WordPress
                        </h4>
                      </div>
                      <div className="text-yellow-700 text-sm space-y-1">
                        <p>
                          <strong>روش ۱:</strong> همان کد HTML معمولی (بالا) -
                          کار می‌کند
                        </p>
                        <p>
                          <strong>روش ۲:</strong> پلاگین + shortcode - راحت‌تر
                        </p>
                        <p>
                          <strong>روش ۳:</strong> تابع سفارشی در functions.php -
                          برای طراحان
                        </p>
                      </div>
                    </div>

                    {/* Quick WordPress Steps */}
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-xl">
                      <h3 className="text-lg font-bold text-green-800 mb-4">
                        🎯 روش ۲: Shortcode WordPress
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                            1
                          </div>
                          <h4 className="font-semibold">شناسه را وارد کنید</h4>
                          <p className="text-sm text-gray-600">
                            business-id خود را از پنل دریافت کنید
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                            2
                          </div>
                          <h4 className="font-semibold">کد را کپی کنید</h4>
                          <p className="text-sm text-gray-600">
                            کد آماده را کپی کنید
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                            ✓
                          </div>
                          <h4 className="font-semibold">در صفحه بچسبانید</h4>
                          <p className="text-sm text-gray-600">
                            در ویرایشگر WordPress
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* WordPress Shortcode Generator */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                          🔧
                        </span>
                        تولید کد WordPress
                      </h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              شناسه کسب‌وکار *
                            </label>
                            <input
                              type="text"
                              id="wp-business-id"
                              placeholder="business-123"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              تم
                            </label>
                            <select
                              id="wp-theme"
                              className="w-full p-3 border border-gray-300 rounded-lg"
                            >
                              <option value="light">روشن</option>
                              <option value="dark">تیره</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              رنگ اصلی
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                id="wp-color"
                                value="#3b82f6"
                                className="h-11 w-20 border border-gray-300 rounded-lg cursor-pointer"
                                style={{ backgroundColor: "#3b82f6" }}
                                onInput={(e) => {
                                  const target = e.target as HTMLInputElement;
                                  target.style.backgroundColor = target.value;
                                  // Update text input
                                  const textInput = document.getElementById(
                                    "wp-color-text"
                                  ) as HTMLInputElement;
                                  textInput.value = target.value;
                                  // Update preview
                                  const preview = document.getElementById(
                                    "wp-color-preview"
                                  ) as HTMLDivElement;
                                  preview.style.backgroundColor = target.value;
                                }}
                              />
                              <input
                                type="text"
                                id="wp-color-text"
                                value="#3b82f6"
                                placeholder="#3b82f6"
                                className="flex-1 h-11 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onInput={(e) => {
                                  const target = e.target as HTMLInputElement;
                                  const colorInput = document.getElementById(
                                    "wp-color"
                                  ) as HTMLInputElement;
                                  if (target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                                    colorInput.value = target.value;
                                    colorInput.style.backgroundColor =
                                      target.value;
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const colorInput = document.getElementById(
                                    "wp-color"
                                  ) as HTMLInputElement;
                                  const textInput = document.getElementById(
                                    "wp-color-text"
                                  ) as HTMLInputElement;
                                  colorInput.value = "#3b82f6";
                                  textInput.value = "#3b82f6";
                                  colorInput.style.backgroundColor = "#3b82f6";
                                }}
                                className="h-11 px-3 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                بازنشانی
                              </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: "#3b82f6" }}
                                id="wp-color-preview"
                              ></div>
                              <span className="text-xs text-gray-600">
                                پیش‌نمایش رنگ اصلی
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              رنگ ثانویه (اختیاری)
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                id="wp-secondary-color"
                                value="#6366f1"
                                className="h-11 w-20 border border-gray-300 rounded-lg cursor-pointer"
                                style={{ backgroundColor: "#6366f1" }}
                                onInput={(e) => {
                                  const target = e.target as HTMLInputElement;
                                  target.style.backgroundColor = target.value;
                                  // Update text input
                                  const textInput = document.getElementById(
                                    "wp-secondary-color-text"
                                  ) as HTMLInputElement;
                                  textInput.value = target.value;
                                  // Update preview
                                  const preview = document.getElementById(
                                    "wp-secondary-color-preview"
                                  ) as HTMLDivElement;
                                  preview.style.backgroundColor = target.value;
                                }}
                              />
                              <input
                                type="text"
                                id="wp-secondary-color-text"
                                value="#6366f1"
                                placeholder="#6366f1"
                                className="flex-1 h-11 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onInput={(e) => {
                                  const target = e.target as HTMLInputElement;
                                  const colorInput = document.getElementById(
                                    "wp-secondary-color"
                                  ) as HTMLInputElement;
                                  if (target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                                    colorInput.value = target.value;
                                    colorInput.style.backgroundColor =
                                      target.value;
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const colorInput = document.getElementById(
                                    "wp-secondary-color"
                                  ) as HTMLInputElement;
                                  const textInput = document.getElementById(
                                    "wp-secondary-color-text"
                                  ) as HTMLInputElement;
                                  colorInput.value = "#6366f1";
                                  textInput.value = "#6366f1";
                                  colorInput.style.backgroundColor = "#6366f1";
                                }}
                                className="h-11 px-3 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                بازنشانی
                              </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: "#6366f1" }}
                                id="wp-secondary-color-preview"
                              ></div>
                              <span className="text-xs text-gray-600">
                                پیش‌نمایش رنگ ثانویه
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              لوگوی سفارشی (اختیاری)
                            </label>
                            <input
                              type="text"
                              id="wp-custom-logo"
                              placeholder="https://example.com/logo.png"
                              className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const businessId = (
                                document.getElementById(
                                  "wp-business-id"
                                ) as HTMLInputElement
                              )?.value;
                              const theme = (
                                document.getElementById(
                                  "wp-theme"
                                ) as HTMLSelectElement
                              )?.value;
                              const color = (
                                document.getElementById(
                                  "wp-color-text"
                                ) as HTMLInputElement
                              )?.value;
                              const secondaryColor = (
                                document.getElementById(
                                  "wp-secondary-color-text"
                                ) as HTMLInputElement
                              )?.value;
                              const customLogo = (
                                document.getElementById(
                                  "wp-custom-logo"
                                ) as HTMLInputElement
                              )?.value;

                              if (!businessId.trim()) {
                                alert("لطفاً شناسه کسب‌وکار را وارد کنید");
                                return;
                              }

                              let code = `[xsme_booking business_id="${businessId.trim()}"`;
                              if (theme !== "light")
                                code += ` theme="${theme}"`;
                              if (color !== "#3b82f6")
                                code += ` primary_color="${color}"`;
                              if (
                                secondaryColor &&
                                secondaryColor !== "#6366f1" &&
                                secondaryColor.trim()
                              )
                                code += ` secondary_color="${secondaryColor.trim()}"`;
                              if (customLogo && customLogo.trim())
                                code += ` custom_logo="${customLogo.trim()}"`;
                              code += "]";

                              const codeElement =
                                document.getElementById("wp-generated-code");
                              if (codeElement) codeElement.textContent = code;
                            }}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            تولید کد WordPress
                          </button>
                        </div>

                        <div className="space-y-4">
                          <label className="block text-sm font-medium">
                            کد آماده برای WordPress:
                          </label>
                          <div className="bg-gray-900 rounded-lg overflow-hidden">
                            <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                              <span className="text-gray-400 text-sm">
                                shortcode.txt
                              </span>
                              <button
                                onClick={() => {
                                  const codeElement =
                                    document.getElementById(
                                      "wp-generated-code"
                                    );
                                  if (codeElement) {
                                    navigator.clipboard
                                      .writeText(codeElement.textContent || "")
                                      .then(() => {
                                        const btn =
                                          document.getElementById(
                                            "wp-copy-btn"
                                          );
                                        if (btn) {
                                          btn.textContent = "✅ کپی شد!";
                                          setTimeout(() => {
                                            btn.textContent = "📋 کپی";
                                          }, 2000);
                                        }
                                      });
                                  }
                                }}
                                className="text-gray-400 hover:text-white text-sm"
                                id="wp-copy-btn"
                              >
                                📋 کپی
                              </button>
                            </div>
                            <div className="p-4">
                              <code
                                id="wp-generated-code"
                                className="text-green-400 text-sm"
                              >
                                [xsme_booking business_id="business-123"]
                              </code>
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-sm">
                              💡 این کد را در هر صفحه، پست، یا ویجت WordPress
                              قرار دهید
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WordPress Method Comparison */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        مقایسه روش‌های WordPress
                      </h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Method 1: Regular HTML */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              1
                            </span>
                            <h4 className="font-semibold text-green-800">
                              روش HTML عادی
                            </h4>
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              بدون پلاگین
                            </Badge>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1 mb-3">
                            <li>✅ نیازی به پلاگین نیست</li>
                            <li>✅ در هر قالب WordPress کار می‌کند</li>
                            <li>✅ کنترل کامل</li>
                            <li>⚠️ باید کد HTML بلد باشید</li>
                          </ul>
                          <CodeBlock
                            id="wp-html-method"
                            title="در ویرایشگر WordPress (حالت Text)"
                            code={`<!-- اول اسکریپت را در footer اضافه کنید -->
<script src="https://widget.x-sme.ir/widget.js"></script>

<!-- سپس در محل دلخواه: -->
<div id="xsme-booking-widget" 
     data-business-id="your-business-id">
</div>`}
                          />
                        </div>

                        {/* Method 2: Shortcode */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              2
                            </span>
                            <h4 className="font-semibold text-blue-800">
                              روش Shortcode
                            </h4>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              نیاز به پلاگین
                            </Badge>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1 mb-3">
                            <li>✅ خیلی آسان</li>
                            <li>✅ بدون دانش فنی</li>
                            <li>✅ پنل تنظیمات</li>
                            <li>⚠️ نیاز به نصب پلاگین</li>
                          </ul>
                          <CodeBlock
                            id="wp-shortcode-method"
                            title="در ویرایشگر WordPress"
                            code={`[xsme_booking business_id="your-business-id"]`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* WordPress Step-by-Step */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        راهنمای تصویری WordPress (هر دو روش)
                      </h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                          <h4 className="font-semibold text-blue-800">
                            گام ۱: ورود به پنل WordPress
                          </h4>
                          <p className="text-blue-700 text-sm mt-1">
                            به آدرس سایت‌تان.com/wp-admin بروید و وارد شوید
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
                          <h4 className="font-semibold text-green-800">
                            گام ۲: ویرایش صفحه
                          </h4>
                          <p className="text-green-700 text-sm mt-1">
                            روی "صفحات" کلیک کنید و صفحه دلخواه را برای ویرایش
                            باز کنید
                          </p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 p-4 rounded-r-lg">
                          <h4 className="font-semibold text-purple-800">
                            گام ۳: اضافه کردن کد
                          </h4>
                          <p className="text-purple-700 text-sm mt-1">
                            <strong>روش HTML:</strong> حالت "Text" را انتخاب
                            کنید و کد HTML را بچسبانید
                            <br />
                            <strong>روش Shortcode:</strong> shortcode را در هر
                            قسمت بچسبانید
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* WordPress Plugin Option */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-800 mb-4">
                        🔌 پلاگین WordPress (اختیاری - برای راحتی)
                      </h3>
                      <p className="text-purple-700 mb-4">
                        اگر روش shortcode را ترجیح می‌دهید، پلاگین را نصب کنید:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700 text-sm">
                            تنظیمات مرکزی در پنل WordPress
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700 text-sm">
                            دکمه مخصوص در ویرایشگر
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700 text-sm">
                            پشتیبانی از Gutenberg
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={() =>
                            window.open(
                              "mailto:support@x-sme.ir?subject=درخواست پلاگین WordPress",
                              "_blank"
                            )
                          }
                        >
                          📧 درخواست پلاگین
                        </Button>
                      </div>
                    </div>

                    {/* Common WordPress Issues */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        حل مشکلات رایج WordPress
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">
                            ❌ ویجت نمایش داده نمی‌شود
                          </h4>
                          <ul className="text-red-700 text-sm space-y-1">
                            <li>• شناسه کسب‌وکار را بررسی کنید</li>
                            <li>• کش سایت را پاک کنید</li>
                            <li>• از حالت "متن" ویرایشگر استفاده کنید</li>
                            <li>• پلاگین‌های امنیتی را بررسی کنید</li>
                          </ul>
                        </div>
                        <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">
                            ⚠️ کد کار نمی‌کند
                          </h4>
                          <ul className="text-orange-700 text-sm space-y-1">
                            <li>• فاصله اضافی در کد نباشد</li>
                            <li>• از ویرایشگر "متن" استفاده کنید</li>
                            <li>• کد را دوباره تولید کنید</li>
                            <li>• با پشتیبانی تماس بگیرید</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Configuration */}
            <section id="configuration">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">تنظیمات ویجت</CardTitle>
                        <CardDescription>
                          همه گزینه‌های شخصی‌سازی
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="attributes" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="attributes">
                          ویژگی‌های HTML
                        </TabsTrigger>
                        <TabsTrigger value="styling">استایل‌دهی</TabsTrigger>
                        <TabsTrigger value="behavior">رفتار</TabsTrigger>
                      </TabsList>

                      <TabsContent value="attributes" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            ویژگی‌های HTML
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 rounded-lg">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-3 text-right font-semibold">
                                    ویژگی
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold">
                                    نوع
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold">
                                    پیش‌فرض
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold">
                                    توضیحات
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                <tr>
                                  <td className="px-4 py-3">
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                      data-business-id
                                    </code>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="destructive">الزامی</Badge>
                                  </td>
                                  <td className="px-4 py-3">-</td>
                                  <td className="px-4 py-3">شناسه کسب‌وکار</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3">
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                      data-theme
                                    </code>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="secondary">اختیاری</Badge>
                                  </td>
                                  <td className="px-4 py-3">light</td>
                                  <td className="px-4 py-3">
                                    تم رنگی: light, dark
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3">
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                      data-language
                                    </code>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="secondary">اختیاری</Badge>
                                  </td>
                                  <td className="px-4 py-3">fa</td>
                                  <td className="px-4 py-3">
                                    زبان: fa (فارسی), en (انگلیسی)
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3">
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                      data-primary-color
                                    </code>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="secondary">اختیاری</Badge>
                                  </td>
                                  <td className="px-4 py-3">#3b82f6</td>
                                  <td className="px-4 py-3">رنگ اصلی (HEX)</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3">
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                      data-secondary-color
                                    </code>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="secondary">اختیاری</Badge>
                                  </td>
                                  <td className="px-4 py-3">-</td>
                                  <td className="px-4 py-3">
                                    رنگ ثانویه برای گرادیان (HEX)
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3">
                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                      data-custom-logo
                                    </code>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="secondary">اختیاری</Badge>
                                  </td>
                                  <td className="px-4 py-3">-</td>
                                  <td className="px-4 py-3">
                                    URL لوگوی سفارشی
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-semibold mb-3">
                            نمونه کامل:
                          </h4>
                          <CodeBlock
                            id="full-config"
                            title="full-configuration.html"
                            code={`<div id="xsme-booking-widget" 
     data-business-id="your-business-id"
     data-theme="light"
     data-language="fa"
     data-primary-color="#ec4899"
     data-secondary-color="#f97316"
     data-custom-logo="https://example.com/logo.png"
     data-border-radius="12"
     data-show-logo="true"
     data-show-business-info="true"
     data-allow-notes="true"
     data-require-email="false"
     data-max-advance-booking="30"
     data-min-advance-booking="2">
</div>`}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="styling" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            گزینه‌های ظاهری
                          </h3>
                          <div className="grid gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">
                                تنظیمات رنگ
                              </h4>
                              <CodeBlock
                                id="color-config"
                                code={`data-primary-color="#3b82f6"     <!-- آبی -->
data-primary-color="#ec4899"     <!-- صورتی -->
data-primary-color="#10b981"     <!-- سبز -->

<!-- رنگ ثانویه برای گرادیان -->
data-secondary-color="#6366f1"   <!-- بنفش -->
data-secondary-color="#f97316"   <!-- نارنجی -->
data-secondary-color="#06b6d4"   <!-- آبی روشن -->`}
                              />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-800 mb-2">
                                🎨 لوگوی سفارشی
                              </h4>
                              <p className="text-blue-700 text-sm mb-3">
                                جایگزین کردن لوگوی کسب‌وکار با لوگوی سفارشی
                              </p>
                              <CodeBlock
                                id="custom-logo-config"
                                code={`data-custom-logo="https://example.com/logo.png"
data-custom-logo="https://your-brand.com/logo.svg"
data-custom-logo="https://cdn.example.com/brand-logo.jpg"`}
                              />
                              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                                <p className="text-blue-800 text-sm">
                                  <strong>💡 نکته:</strong> لوگوی سفارشی جایگزین
                                  لوگوی کسب‌وکار می‌شود و در هدر ویجت نمایش داده
                                  می‌شود.
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">
                                تنظیمات شکل
                              </h4>
                              <CodeBlock
                                id="shape-config"
                                code={`data-border-radius="0"      <!-- مربعی -->
data-border-radius="8"      <!-- گرد ملایم -->
data-border-radius="16"     <!-- گرد زیاد -->`}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="behavior" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            تنظیمات رفتاری
                          </h3>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-800 mb-2">
                                محدودیت‌های زمانی
                              </h4>
                              <CodeBlock
                                id="time-limits"
                                code={`data-max-advance-booking="30"    <!-- حداکثر 30 روز از قبل -->
data-min-advance-booking="2"     <!-- حداقل 2 ساعت از قبل -->`}
                              />
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <h4 className="font-semibold text-green-800 mb-2">
                                نمایش اطلاعات
                              </h4>
                              <CodeBlock
                                id="display-options"
                                code={`data-show-logo="true"            <!-- نمایش لوگو -->
data-show-business-info="true"   <!-- نمایش اطلاعات کسب‌وکار -->
data-allow-notes="true"          <!-- امکان یادداشت مشتری -->
data-custom-logo="https://..."   <!-- لوگوی سفارشی -->`}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Events */}
            <section id="events">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          رویدادهای JavaScript
                        </CardTitle>
                        <CardDescription>
                          ردیابی و واکنش به تعاملات کاربر
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="callbacks" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="callbacks">
                          توابع Callback
                        </TabsTrigger>
                        <TabsTrigger value="listeners">
                          Event Listeners
                        </TabsTrigger>
                        <TabsTrigger value="analytics">آنالیتیکس</TabsTrigger>
                      </TabsList>

                      <TabsContent value="callbacks" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            توابع Callback ساده
                          </h3>
                          <p className="text-gray-600 mb-4">
                            ساده‌ترین روش برای واکنش به رویدادهای ویجت
                          </p>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2 text-green-700">
                                رویداد تکمیل رزرو
                              </h4>
                              <CodeBlock
                                id="booking-complete"
                                title="booking-events.js"
                                language="javascript"
                                code={`// رویداد تکمیل رزرو
window.xsmeOnBookingComplete = function(booking) {
    console.log('✅ رزرو تکمیل شد:', booking);
    
    // نمایش پیام موفقیت
    alert(\`رزرو شما با شماره \${booking.id} ثبت شد!\`);
    
    // ارسال به گوگل آنالیتیکس
    if (window.gtag) {
        gtag('event', 'booking_complete', {
            booking_id: booking.id,
            service_name: booking.serviceName,
            amount: booking.amount
        });
    }
};`}
                              />
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 text-blue-700">
                                سایر رویدادها
                              </h4>
                              <CodeBlock
                                id="other-events"
                                title="all-events.js"
                                language="javascript"
                                code={`// رویداد شروع رزرو
window.xsmeOnBookingStarted = function(data) {
    console.log('🎬 شروع فرآیند رزرو:', data);
};

// رویداد انتخاب سرویس
window.xsmeOnServiceSelected = function(service) {
    console.log('🔧 سرویس انتخاب شد:', service);
};

// رویداد انتخاب تاریخ
window.xsmeOnDateSelected = function(date) {
    console.log('📅 تاریخ انتخاب شد:', date);
};

// رویداد خطا
window.xsmeOnError = function(error) {
    console.error('❌ خطا در ویجت:', error);
    // نمایش پیام خطای سفارشی
};`}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="listeners" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Event Listeners پیشرفته
                          </h3>
                          <p className="text-gray-600 mb-4">
                            کنترل دقیق‌تر و انعطاف‌پذیرتر بر رویدادها
                          </p>

                          <CodeBlock
                            id="event-listeners"
                            title="advanced-events.js"
                            language="javascript"
                            code={`// استفاده از Event Listeners
document.addEventListener('xsme:booking:complete', function(event) {
    const booking = event.detail;
    
    // دسترسی به اطلاعات کامل رزرو
    console.log('رزرو کامل:', {
        id: booking.id,
        businessId: booking.businessId,
        serviceName: booking.serviceName,
        amount: booking.amount,
        date: booking.date,
        time: booking.time,
        timestamp: booking.timestamp
    });
    
    // ارسال به سیستم CRM
    if (window.crmSystem) {
        crmSystem.addCustomer(booking);
    }
});

// گوش دادن به چندین رویداد
const events = [
    'xsme:service:selected',
    'xsme:date:selected', 
    'xsme:time:selected',
    'xsme:booking:started'
];

events.forEach(eventName => {
    document.addEventListener(eventName, function(event) {
        console.log(\`رویداد \${eventName}:\`, event.detail);
        
        // ارسال به Google Analytics
        if (window.dataLayer) {
            dataLayer.push({
                event: eventName.replace(':', '_'),
                widget_data: event.detail
            });
        }
    });
});

// گوش دادن به رویدادهای یک ویجت خاص
const widget = document.getElementById('xsme-booking-widget');
widget.addEventListener('xsme:booking:complete', function(event) {
    console.log('رزرو در این ویجت تکمیل شد:', event.detail);
});`}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="analytics" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            ادغام با سیستم‌های آنالیتیکس
                          </h3>

                          <div className="grid gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-orange-500" />
                                Google Analytics
                              </h4>
                              <CodeBlock
                                id="google-analytics"
                                title="google-analytics.js"
                                language="javascript"
                                code={`// Google Analytics 4 Integration
window.xsmeOnBookingComplete = function(booking) {
    if (window.gtag) {
        // رویداد خرید
        gtag('event', 'purchase', {
            transaction_id: booking.id,
            value: booking.amount,
            currency: 'IRR',
            items: [{
                item_id: booking.serviceId,
                item_name: booking.serviceName,
                category: 'booking',
                quantity: 1,
                price: booking.amount
            }]
        });
        
        // رویداد سفارشی
        gtag('event', 'booking_complete', {
            business_type: 'service',
            booking_date: booking.date,
            booking_time: booking.time
        });
    }
};`}
                              />
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-blue-500" />
                                Facebook Pixel
                              </h4>
                              <CodeBlock
                                id="facebook-pixel"
                                title="facebook-pixel.js"
                                language="javascript"
                                code={`// Facebook Pixel Integration
window.xsmeOnBookingComplete = function(booking) {
    if (window.fbq) {
        // رویداد خرید
        fbq('track', 'Purchase', {
            value: booking.amount,
            currency: 'IRR',
            content_name: booking.serviceName,
            content_category: 'booking'
        });
        
        // رویداد Lead
        fbq('track', 'Lead', {
            content_name: booking.serviceName,
            value: booking.amount
        });
    }
};

// ردیابی مراحل فرآیند رزرو
window.xsmeOnServiceSelected = function(service) {
    if (window.fbq) {
        fbq('track', 'InitiateCheckout', {
            content_name: service.serviceName,
            value: service.price
        });
    }
};`}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Events Reference Table */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        جدول مرجع رویدادها
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-right font-semibold">
                                رویداد
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                تابع Callback
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                Event Listener
                              </th>
                              <th className="px-3 py-2 text-right font-semibold">
                                دیتای ارسالی
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-3 py-2">ایجاد ویجت</td>
                              <td className="px-3 py-2">
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                  xsmeOnCreated
                                </code>
                              </td>
                              <td className="px-3 py-2">
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                  xsme:created
                                </code>
                              </td>
                              <td className="px-3 py-2">
                                containerId, businessId, config
                              </td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">آماده شدن</td>
                              <td className="px-3 py-2">
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                  xsmeOnReady
                                </code>
                              </td>
                              <td className="px-3 py-2">
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                  xsme:ready
                                </code>
                              </td>
                              <td className="px-3 py-2">
                                containerId, businessId, config
                              </td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">انتخاب سرویس</td>
                              <td className="px-3 py-2">
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                  xsmeOnServiceSelected
                                </code>
                              </td>
                              <td className="px-3 py-2">
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                  xsme:service:selected
                                </code>
                              </td>
                              <td className="px-3 py-2">
                                serviceId, serviceName, price
                              </td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">تکمیل رزرو</td>
                              <td className="px-3 py-2">
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                  xsmeOnBookingComplete
                                </code>
                              </td>
                              <td className="px-3 py-2">
                                <code className="text-xs bg-gray-100 px-1 rounded">
                                  xsme:booking:complete
                                </code>
                              </td>
                              <td className="px-3 py-2">
                                id, businessId, serviceName, amount
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Examples */}
            <section id="examples">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-l-4 border-l-indigo-500">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          نمونه‌های کاربردی
                        </CardTitle>
                        <CardDescription>
                          استفاده در پلتفرم‌های مختلف
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="html" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="react">React</TabsTrigger>
                        <TabsTrigger value="vue">Vue.js</TabsTrigger>
                        <TabsTrigger value="drupal">Drupal/Joomla</TabsTrigger>
                      </TabsList>

                      <TabsContent value="html" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            HTML ساده
                          </h3>
                          <p className="text-gray-600 mb-4">
                            در هر صفحه HTML، بدون فریمورک خاص
                          </p>
                          <CodeBlock
                            id="html-example"
                            title="index.html"
                            code={`<!DOCTYPE html>
<html>
<head>
    <title>رزرو آنلاین</title>
</head>
<body>
    <h1>خدمات ما</h1>
    
    <!-- ویجت رزرو -->
    <div id="xsme-booking-widget" 
         data-business-id="barber-shop-123"
         data-theme="light"
         data-primary-color="#ff6b6b">
    </div>
    
    <!-- اسکریپت ویجت -->
    <script src="https://widget.x-sme.ir/widget.js"></script>
</body>
</html>`}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="react" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            React/Next.js
                          </h3>
                          <p className="text-gray-600 mb-4">
                            استفاده در کامپوننت‌های React
                          </p>
                          <CodeBlock
                            id="react-example"
                            title="BookingComponent.jsx"
                            language="javascript"
                            code={`import { useEffect } from 'react';

const BookingWidget = ({ businessId }) => {
    useEffect(() => {
        // بارگذاری اسکریپت ویجت
        if (!window.XSME) {
            const script = document.createElement('script');
            script.src = 'https://widget.x-sme.ir/widget.js';
            script.async = true;
            document.body.appendChild(script);
        }
        
        // رویداد تکمیل رزرو
        window.xsmeOnBookingComplete = (booking) => {
            console.log('رزرو تکمیل شد:', booking);
            // ارسال به state management یا API
        };
    }, []);

    return (
        <div className="booking-section">
            <h2>رزرو آنلاین</h2>
            <div 
                id="xsme-booking-widget"
                data-business-id={businessId}
                data-theme="light"
                data-primary-color="#3b82f6"
            />
        </div>
    );
};

export default BookingWidget;`}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="vue" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Vue.js</h3>
                          <p className="text-gray-600 mb-4">
                            استفاده در کامپوننت‌های Vue
                          </p>
                          <CodeBlock
                            id="vue-example"
                            title="BookingWidget.vue"
                            language="javascript"
                            code={`<template>
  <div class="booking-section">
    <h2>رزرو آنلاین</h2>
    <div 
      id="xsme-booking-widget"
      :data-business-id="businessId"
      :data-theme="theme"
      :data-primary-color="primaryColor"
    />
  </div>
</template>

<script>
export default {
  name: 'BookingWidget',
  props: {
    businessId: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'light'
    },
    primaryColor: {
      type: String,
      default: '#3b82f6'
    }
  },
  mounted() {
    // بارگذاری اسکریپت ویجت
    if (!window.XSME) {
      const script = document.createElement('script');
      script.src = 'https://widget.x-sme.ir/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
    
    // رویداد تکمیل رزرو
    window.xsmeOnBookingComplete = (booking) => {
      this.$emit('booking-complete', booking);
    };
  }
};
</script>`}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="drupal" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Drupal & Joomla
                          </h3>
                          <p className="text-gray-600 mb-4">
                            اضافه کردن به محتوا یا قالب
                          </p>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">
                                Drupal - در محتوا:
                              </h4>
                              <CodeBlock
                                id="drupal-content"
                                title="در ویرایشگر محتوا"
                                code={`<!-- در حالت Source/HTML -->
<div id="xsme-booking-widget" 
     data-business-id="dental-clinic-456">
</div>

<script src="https://widget.x-sme.ir/widget.js"></script>`}
                              />
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">
                                Joomla - در مقاله:
                              </h4>
                              <CodeBlock
                                id="joomla-article"
                                title="در ویرایشگر مقاله (حالت Code)"
                                code={`<div id="xsme-booking-widget" 
     data-business-id="beauty-salon-789"
     data-theme="dark">
</div>

<script src="https://widget.x-sme.ir/widget.js"></script>`}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Real-world Examples */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        نمونه‌های واقعی
                      </h3>
                      <div className="grid gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">
                            💇‍♂️ آرایشگاه مردانه
                          </h4>
                          <p className="text-blue-700 text-sm mb-3">
                            سایت HTML ساده با ویجت رزرو برای کوتاهی مو
                          </p>
                          <CodeBlock
                            id="barber-example"
                            code={`<div id="xsme-booking-widget" 
     data-business-id="barber-downtown-123"
     data-theme="dark"
     data-primary-color="#1a1a1a"
     data-show-business-info="true"
     data-allow-notes="true">
</div>`}
                          />
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">
                            🦷 کلینیک دندانپزشکی
                          </h4>
                          <p className="text-green-700 text-sm mb-3">
                            سایت WordPress با پلاگین برای نوبت‌دهی
                          </p>
                          <CodeBlock
                            id="dental-example"
                            code={`[xsme_booking 
business_id="dental-clinic-456" 
theme="light" 
primary_color="#10b981" 
require_email="true"
max_advance_booking="60"]`}
                          />
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-800 mb-2">
                            💄 سالن زیبایی
                          </h4>
                          <p className="text-purple-700 text-sm mb-3">
                            اپلیکیشن React برای رزرو خدمات زیبایی
                          </p>
                          <CodeBlock
                            id="beauty-example"
                            language="javascript"
                            code={`<BookingWidget 
    businessId="beauty-salon-789"
    theme="light"
    primaryColor="#ec4899"
    secondaryColor="#f97316"
    customLogo="https://beauty-salon.com/logo.png"
    showLogo={true}
    onBookingComplete={(booking) => {
        // ارسال به گوگل آنالیتیکس
        gtag('event', 'booking_complete', {
            service: booking.serviceName,
            value: booking.amount
        });
    }}
/>`}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Best Practices */}
            <section id="best-practices">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-l-4 border-l-emerald-500">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          بهترین شیوه‌ها
                        </CardTitle>
                        <CardDescription>
                          راهکارهای بهینه‌سازی و توصیه‌های کاربردی
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Monitor className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800 mb-2">
                              بهینه‌سازی عملکرد
                            </h3>
                            <ul className="text-green-700 space-y-2">
                              <li>• اسکریپت را غیرهمزمان بارگذاری کنید</li>
                              <li>
                                • از lazy loading برای ویجت‌های پایین صفحه
                                استفاده کنید
                              </li>
                              <li>
                                • تنها رویدادهای مورد نیاز را پیاده‌سازی کنید
                              </li>
                            </ul>
                            <CodeBlock
                              id="performance"
                              title="async-loading.html"
                              code={`<script async src="https://widget.x-sme.ir/widget.js"></script>`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-800 mb-2">
                              طراحی واکنش‌گرا
                            </h3>
                            <ul className="text-blue-700 space-y-2">
                              <li>• ویجت به صورت خودکار واکنش‌گرا است</li>
                              <li>
                                • برای موبایل حداقل ۳۲۰ پیکسل عرض در نظر بگیرید
                              </li>
                              <li>
                                • در تبلت و دسکتاپ حداکثر ۵۰۰ پیکسل عرض توصیه
                                می‌شود
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-purple-800 mb-2">
                              تجربه کاربری
                            </h3>
                            <ul className="text-purple-700 space-y-2">
                              <li>• رنگ اصلی را با برند خود هماهنگ کنید</li>
                              <li>• پیام‌های موفقیت سفارشی تعریف کنید</li>
                              <li>
                                • از آنالیتیکس برای بهبود مداوم استفاده کنید
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">عیب‌یابی</CardTitle>
                        <CardDescription>
                          حل مشکلات رایج و رفع اشکال
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="border border-orange-200 rounded-lg p-4">
                        <h3 className="font-semibold text-orange-800 mb-2">
                          🚫 ویجت نمایش داده نمی‌شود
                        </h3>
                        <div className="text-orange-700 space-y-2">
                          <p>
                            <strong>راه‌حل‌ها:</strong>
                          </p>
                          <ul className="mr-4 space-y-1">
                            <li>• بررسی صحت business-id</li>
                            <li>• کنترل اتصال اینترنت</li>
                            <li>• بررسی console مرورگر برای خطاها</li>
                          </ul>
                        </div>
                      </div>

                      <div className="border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">
                          ⚡ ویجت کند بارگذاری می‌شود
                        </h3>
                        <div className="text-blue-700 space-y-2">
                          <p>
                            <strong>راه‌حل‌ها:</strong>
                          </p>
                          <ul className="mr-4 space-y-1">
                            <li>• استفاده از بارگذاری غیرهمزمان</li>
                            <li>• قرار دادن اسکریپت در انتهای صفحه</li>
                            <li>• بررسی سایر اسکریپت‌های سنگین</li>
                          </ul>
                        </div>
                      </div>

                      <div className="border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 mb-2">
                          ❌ رویدادها کار نمی‌کنند
                        </h3>
                        <div className="text-red-700 space-y-2">
                          <p>
                            <strong>راه‌حل‌ها:</strong>
                          </p>
                          <ul className="mr-4 space-y-1">
                            <li>• بررسی صحت نام توابع callback</li>
                            <li>• کنترل console برای خطاهای JavaScript</li>
                            <li>• اطمینان از بارگذاری کامل ویجت</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">
                        🔍 کدهای تست و عیب‌یابی
                      </h3>
                      <CodeBlock
                        id="debug-code"
                        title="debug.js"
                        language="javascript"
                        code={`// کد تست برای بررسی عملکرد ویجت
console.log('Widget version:', window.XSME?.version);
console.log('Widget config:', window.XSME?.config);

// تست رویدادها
window.xsmeOnError = function(error) {
    console.error('Widget Error:', error);
    alert('خطا: ' + error.error);
};

// بررسی بارگذاری ویجت
window.xsmeOnReady = function(data) {
    console.log('✅ ویجت آماده است:', data);
    alert('ویجت با موفقیت بارگذاری شد!');
};`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Contact Support */}
            <section className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">
                      نیاز به کمک دارید؟
                    </h2>
                    <p className="text-lg opacity-90 mb-6">
                      تیم پشتیبانی ما آماده کمک به شما است
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="text-blue-700"
                        asChild
                      >
                        <a href="mailto:support@x-sme.ir">
                          <Mail className="mr-2 h-5 w-5" />
                          support@x-sme.ir
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white text-white hover:bg-white hover:text-blue-700"
                        asChild
                      >
                        <a href="tel:+989123456789">
                          <Phone className="mr-2 h-5 w-5" />
                          ۰۹۱۲-۳۴۵-۶۷۸۹
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WidgetDocs;
