import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  ChevronRight,
  Play,
  Settings,
  Zap,
  CheckCircle,
  AlertTriangle,
  Code,
  Palette,
  Globe,
  Smartphone,
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
import { Input } from "@components/ui/input";

const WordPressGuide: React.FC = () => {
  const [businessId, setBusinessId] = useState("");
  const [theme, setTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#6366f1");
  const [customLogo, setCustomLogo] = useState("");
  const [borderRadius, setBorderRadius] = useState(8);
  const [showLogo, setShowLogo] = useState(true);
  const [allowNotes, setAllowNotes] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  const generateShortcode = () => {
    if (!businessId.trim()) {
      return '[xsme_booking business_id="your-business-id"]';
    }

    let shortcode = "[xsme_booking";
    shortcode += ` business_id="${businessId.trim()}"`;
    if (theme !== "light") shortcode += ` theme="${theme}"`;
    if (primaryColor !== "#3b82f6")
      shortcode += ` primary_color="${primaryColor}"`;
    if (secondaryColor && secondaryColor !== "#6366f1")
      shortcode += ` secondary_color="${secondaryColor}"`;
    if (customLogo.trim()) shortcode += ` custom_logo="${customLogo.trim()}"`;
    if (borderRadius !== 8) shortcode += ` border_radius="${borderRadius}"`;
    if (!showLogo) shortcode += ` show_logo="false"`;
    if (!allowNotes) shortcode += ` allow_notes="false"`;
    shortcode += "]";
    return shortcode;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const wordpressPlugin = `<?php
/**
 * Plugin Name: X-SME Booking Widget
 * Description: ویجت رزرو ساده برای WordPress
 * Version: 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) exit;

// Add shortcode
function xsme_booking_shortcode($atts) {
    $atts = shortcode_atts(array(
        'business_id' => '',
        'theme' => 'light',
        'primary_color' => '#3b82f6',
        'secondary_color' => '',
        'custom_logo' => '',
        'border_radius' => '8',
        'show_logo' => 'true',
        'allow_notes' => 'true',
    ), $atts);
    
    if (empty($atts['business_id'])) {
        return '<p style="color: red;">❌ لطفاً شناسه کسب‌وکار را وارد کنید</p>';
    }
    
    // Enqueue script
    wp_enqueue_script('xsme-widget', 'https://widget.x-sme.ir/widget.js', array(), '1.0.0', true);
    
    $widget_id = 'xsme-widget-' . uniqid();
    
    $output = '<div id="' . $widget_id . '" ';
    $output .= 'data-business-id="' . esc_attr($atts['business_id']) . '" ';
    $output .= 'data-theme="' . esc_attr($atts['theme']) . '" ';
    $output .= 'data-primary-color="' . esc_attr($atts['primary_color']) . '" ';
    if (!empty($atts['secondary_color'])) {
        $output .= 'data-secondary-color="' . esc_attr($atts['secondary_color']) . '" ';
    }
    if (!empty($atts['custom_logo'])) {
        $output .= 'data-custom-logo="' . esc_attr($atts['custom_logo']) . '" ';
    }
    $output .= 'data-border-radius="' . esc_attr($atts['border_radius']) . '" ';
    $output .= 'data-show-logo="' . esc_attr($atts['show_logo']) . '" ';
    $output .= 'data-allow-notes="' . esc_attr($atts['allow_notes']) . '" ';
    $output .= 'style="width: 100%; min-height: 400px; margin: 20px 0;">';
    
    $output .= '<div style="padding: 40px; text-align: center; background: #f8f9fa; border-radius: 12px; border: 2px dashed #ddd;">';
    $output .= '<div style="font-size: 24px; margin-bottom: 10px;">⏳</div>';
    $output .= '<p style="margin: 0; color: #666;">در حال بارگذاری ویجت رزرو...</p>';
    $output .= '</div></div>';
    
    return $output;
}
add_shortcode('xsme_booking', 'xsme_booking_shortcode');

// Add button to editor
function xsme_add_editor_button() {
    if (current_user_can('edit_posts') && current_user_can('edit_pages')) {
        add_filter('mce_external_plugins', 'xsme_add_tinymce_plugin');
        add_filter('mce_buttons', 'xsme_register_button');
    }
}
add_action('admin_head', 'xsme_add_editor_button');

function xsme_register_button($buttons) {
    array_push($buttons, 'xsme_button');
    return $buttons;
}

function xsme_add_tinymce_plugin($plugin_array) {
    $plugin_array['xsme_button'] = plugin_dir_url(__FILE__) . 'xsme-button.js';
    return $plugin_array;
}
?>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                <Globe className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              راهنمای WordPress
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              ویجت رزرو را بدون هیچ دانش فنی در WordPress نصب کنید
            </p>
            <Badge className="mt-6 bg-green-500 text-white px-6 py-2 text-lg">
              ✅ ۱۰۰٪ بدون کد نویسی
            </Badge>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-green-800">
                شروع ۳ دقیقه‌ای!
              </CardTitle>
              <CardDescription className="text-green-700 text-lg">
                فقط ۳ مرحله تا داشتن ویجت رزرو در سایت WordPress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: "۱",
                    title: "کپی کردن کد",
                    description: "شناسه کسب‌وکار را وارد کنید و کد را کپی کنید",
                    icon: Copy,
                    color: "blue",
                  },
                  {
                    step: "۲",
                    title: "چسباندن در صفحه",
                    description:
                      "وارد ویرایشگر WordPress شوید و کد را بچسبانید",
                    icon: Code,
                    color: "purple",
                  },
                  {
                    step: "۳",
                    title: "تمام!",
                    description: "ویجت آماده است و مشتریان می‌توانند رزرو کنند",
                    icon: CheckCircle,
                    color: "green",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center
                        ${item.color === "blue" ? "bg-blue-100" : ""}
                        ${item.color === "purple" ? "bg-purple-100" : ""}
                        ${item.color === "green" ? "bg-green-100" : ""}
                      `}
                    >
                      <item.icon
                        className={`w-6 h-6
                          ${item.color === "blue" ? "text-blue-600" : ""}
                          ${item.color === "purple" ? "text-purple-600" : ""}
                          ${item.color === "green" ? "text-green-600" : ""}
                        `}
                      />
                    </div>
                    <div
                      className={`w-8 h-8 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold
                        ${item.color === "blue" ? "bg-blue-500" : ""}
                        ${item.color === "purple" ? "bg-purple-500" : ""}
                        ${item.color === "green" ? "bg-green-500" : ""}
                      `}
                    >
                      {item.step}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Code Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">تولید کد WordPress</CardTitle>
                  <CardDescription>
                    تنظیمات را انجام دهید و کد آماده دریافت کنید
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Settings */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    تنظیمات ویجت
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شناسه کسب‌وکار *
                    </label>
                    <Input
                      value={businessId}
                      onChange={(e) => setBusinessId(e.target.value)}
                      placeholder="business-id-123"
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      این شناسه را از پنل X-SME دریافت کنید
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تم
                      </label>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="light">روشن</option>
                        <option value="dark">تیره</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        گردی گوشه‌ها
                      </label>
                      <select
                        value={borderRadius}
                        onChange={(e) =>
                          setBorderRadius(Number(e.target.value))
                        }
                        className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="0">مربعی</option>
                        <option value="8">ملایم</option>
                        <option value="16">گرد</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رنگ اصلی
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                          console.log("Primary color changed:", e.target.value);
                          setPrimaryColor(e.target.value);
                        }}
                        className="h-11 w-20 border border-gray-300 rounded-lg cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                            console.log("Primary color input changed:", value);
                            setPrimaryColor(value);
                          }
                        }}
                        className="h-11"
                        placeholder="#3b82f6"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("Resetting primary color to #3b82f6");
                          setPrimaryColor("#3b82f6");
                        }}
                        className="h-11 px-3 text-xs"
                      >
                        بازنشانی
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      رنگ فعلی: {primaryColor}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: primaryColor }}
                      ></div>
                      <span className="text-xs text-gray-600">
                        پیش‌نمایش رنگ اصلی
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رنگ ثانویه (اختیاری)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => {
                          console.log(
                            "Secondary color changed:",
                            e.target.value
                          );
                          setSecondaryColor(e.target.value);
                        }}
                        className="h-11 w-20 border border-gray-300 rounded-lg cursor-pointer"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                            console.log(
                              "Secondary color input changed:",
                              value
                            );
                            setSecondaryColor(value);
                          }
                        }}
                        className="h-11"
                        placeholder="#6366f1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("Resetting secondary color to #6366f1");
                          setSecondaryColor("#6366f1");
                        }}
                        className="h-11 px-3 text-xs"
                      >
                        بازنشانی
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      رنگ فعلی: {secondaryColor} - برای گرادیان‌های زیبا
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: secondaryColor }}
                      ></div>
                      <span className="text-xs text-gray-600">
                        پیش‌نمایش رنگ ثانویه
                      </span>
                    </div>
                    {primaryColor !== "#3b82f6" &&
                      secondaryColor !== "#6366f1" && (
                        <div className="mt-2 flex items-center gap-2">
                          <div
                            className="w-12 h-6 rounded border border-gray-300"
                            style={{
                              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                            }}
                          ></div>
                          <span className="text-xs text-gray-600">
                            پیش‌نمایش گرادیان
                          </span>
                        </div>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لوگوی سفارشی (اختیاری)
                    </label>
                    <Input
                      value={customLogo}
                      onChange={(e) => setCustomLogo(e.target.value)}
                      className="h-11"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL لوگوی سفارشی (جایگزین لوگوی کسب‌وکار)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      گزینه‌های نمایش
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={showLogo}
                          onChange={(e) => setShowLogo(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">نمایش لوگو</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={allowNotes}
                          onChange={(e) => setAllowNotes(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">امکان یادداشت</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Generated Code */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    کد آماده برای WordPress
                  </h3>

                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-400 text-sm ml-3">
                          shortcode.txt
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-6 px-2 text-xs ${
                          copiedCode === "shortcode"
                            ? "text-green-400"
                            : "text-gray-400 hover:text-white"
                        }`}
                        onClick={() =>
                          copyToClipboard(generateShortcode(), "shortcode")
                        }
                      >
                        {copiedCode === "shortcode" ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="p-4">
                      <code className="text-green-400 text-sm break-all">
                        {generateShortcode()}
                      </code>
                    </div>
                  </div>

                  {!businessId && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <p className="text-amber-800 text-sm">
                          برای تولید کد، لطفاً شناسه کسب‌وکار را وارد کنید
                        </p>
                      </div>
                    </div>
                  )}

                  {businessId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-800 font-medium">
                          کد آماده است!
                        </p>
                      </div>
                      <p className="text-green-700 text-sm">
                        این کد را در ویرایشگر WordPress کپی کنید تا ویجت نمایش
                        داده شود
                      </p>
                      {(primaryColor !== "#3b82f6" ||
                        secondaryColor !== "#6366f1") && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-800 text-sm">
                            🎨 رنگ‌های سفارشی در کد اعمال شده‌اند
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!businessId}
                      onClick={() =>
                        copyToClipboard(generateShortcode(), "shortcode")
                      }
                    >
                      {copiedCode === "shortcode" ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          کپی شد!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 mr-2" />
                          کپی کد
                        </>
                      )}
                    </Button>

                    {businessId && (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => {
                          const params = new URLSearchParams({
                            businessId,
                            theme,
                            primaryColor,
                            borderRadius: borderRadius.toString(),
                            showLogo: showLogo.toString(),
                            allowNotes: allowNotes.toString(),
                          });
                          if (secondaryColor)
                            params.append("secondaryColor", secondaryColor);
                          if (customLogo)
                            params.append("customLogo", customLogo);
                          window.open(`/widget?${params.toString()}`, "_blank");
                        }}
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        پیش‌نمایش ویجت
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step by Step Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                راهنمای گام به گام WordPress
              </CardTitle>
              <CardDescription className="text-center text-lg">
                دقیقاً چطور ویجت را در WordPress اضافه کنیم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: "ورود به پنل WordPress",
                    description: "وارد پنل مدیریت سایت WordPress خود شوید",
                    details: [
                      "آدرس yoursite.com/wp-admin را باز کنید",
                      "نام کاربری و رمز عبور خود را وارد کنید",
                      "روی دکمه ورود کلیک کنید",
                    ],
                    screenshot: "wp-login.png",
                  },
                  {
                    step: 2,
                    title: "ایجاد صفحه جدید یا ویرایش صفحه موجود",
                    description:
                      "صفحه‌ای که می‌خواهید ویجت در آن باشد را باز کنید",
                    details: [
                      "از منوی چپ، روی 'صفحات' کلیک کنید",
                      "روی 'افزودن صفحه جدید' یا صفحه موجود کلیک کنید",
                      "وارد ویرایشگر متن شوید",
                    ],
                    screenshot: "wp-pages.png",
                  },
                  {
                    step: 3,
                    title: "چسباندن کد در محل دلخواه",
                    description:
                      "کد شورت‌کد را در ویرایشگر WordPress قرار دهید",
                    details: [
                      "کد تولید شده را کپی کنید",
                      "در ویرایشگر، محل دلخواه را کلیک کنید",
                      "کد را با Ctrl+V بچسبانید",
                    ],
                    screenshot: "wp-editor.png",
                  },
                  {
                    step: 4,
                    title: "ذخیره و انتشار",
                    description: "تغییرات را ذخیره کنید تا ویجت نمایش داده شود",
                    details: [
                      "روی دکمه 'انتشار' یا 'بروزرسانی' کلیک کنید",
                      "منتظر بمانید تا صفحه ذخیره شود",
                      "صفحه را باز کنید تا ویجت را ببینید",
                    ],
                    screenshot: "wp-publish.png",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-700 mb-4">{item.description}</p>
                      <ul className="space-y-2">
                        {item.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <ChevronRight className="w-4 h-4 text-blue-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* WordPress Plugin Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-purple-800">
                    پلاگین WordPress (پیشرفته)
                  </CardTitle>
                  <CardDescription className="text-purple-700 text-lg">
                    برای کاربرانی که می‌خواهند پلاگین مخصوص نصب کنند
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    مزایای پلاگین:
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "تنظیمات مرکزی در پنل WordPress",
                      "دکمه مخصوص در ویرایشگر",
                      "امکان استفاده در sidebar",
                      "تنظیمات پیش‌فرض برای همه صفحات",
                      "پشتیبانی از Gutenberg",
                      "مدیریت آسان‌تر چندین ویجت",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-purple-700"
                      >
                        <CheckCircle className="w-5 h-5 text-purple-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    نحوه نصب پلاگین:
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-purple-900 rounded-lg">
                      <div className="bg-purple-800 px-4 py-2 flex items-center justify-between rounded-t-lg">
                        <span className="text-purple-200 text-sm">
                          xsme-widget.php
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-200 hover:text-white h-6 px-2"
                          onClick={() =>
                            copyToClipboard(wordpressPlugin, "plugin")
                          }
                        >
                          {copiedCode === "plugin" ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="p-4 max-h-60 overflow-y-auto">
                        <code className="text-purple-200 text-xs whitespace-pre-wrap">
                          {wordpressPlugin.substring(0, 500)}...
                        </code>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-purple-700">
                      <p>1. کد بالا را کپی کنید</p>
                      <p>
                        2. فایل جدیدی با نام{" "}
                        <code className="bg-purple-200 px-1 rounded">
                          xsme-widget.php
                        </code>{" "}
                        ایجاد کنید
                      </p>
                      <p>3. کد را در فایل قرار دهید</p>
                      <p>
                        4. فایل را در پوشه{" "}
                        <code className="bg-purple-200 px-1 rounded">
                          wp-content/plugins/
                        </code>{" "}
                        آپلود کنید
                      </p>
                      <p>5. از پنل WordPress پلاگین را فعال کنید</p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => copyToClipboard(wordpressPlugin, "plugin")}
                    >
                      {copiedCode === "plugin" ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          کپی شد!
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          دانلود کد پلاگین
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Troubleshooting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                حل مشکلات رایج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    problem: "ویجت نمایش داده نمی‌شود",
                    solutions: [
                      "شناسه کسب‌وکار را بررسی کنید",
                      "اتصال اینترنت سایت را کنترل کنید",
                      "از مرورگر مختلف امتحان کنید",
                      "کش سایت را پاک کنید",
                    ],
                    icon: AlertTriangle,
                    color: "red",
                  },
                  {
                    problem: "کد کار نمی‌کند",
                    solutions: [
                      "مطمئن شوید در حالت متن نوشته باشید",
                      "فاصله اضافی در کد نداشته باشید",
                      "شناسه کسب‌وکار درست وارد شده باشد",
                      "کد را دوباره تولید کنید",
                    ],
                    icon: Code,
                    color: "orange",
                  },
                  {
                    problem: "ویجت آهسته بارگذاری می‌شود",
                    solutions: [
                      "سرعت اینترنت را بررسی کنید",
                      "از CDN استفاده کنید",
                      "پلاگین‌های کش را موقتاً غیرفعال کنید",
                      "با پشتیبانی تماس بگیرید",
                    ],
                    icon: Zap,
                    color: "blue",
                  },
                  {
                    problem: "ظاهر ویجت درست نیست",
                    solutions: [
                      "تنظیمات تم سایت را بررسی کنید",
                      "CSS سفارشی اضافه کنید",
                      "رنگ اصلی را تغییر دهید",
                      "تم ویجت را عوض کنید",
                    ],
                    icon: Palette,
                    color: "purple",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 
                      ${item.color === "red" ? "border-red-200 bg-red-50" : ""}
                      ${item.color === "orange" ? "border-orange-200 bg-orange-50" : ""}
                      ${item.color === "blue" ? "border-blue-200 bg-blue-50" : ""}
                      ${item.color === "purple" ? "border-purple-200 bg-purple-50" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center
                          ${item.color === "red" ? "bg-red-100" : ""}
                          ${item.color === "orange" ? "bg-orange-100" : ""}
                          ${item.color === "blue" ? "bg-blue-100" : ""}
                          ${item.color === "purple" ? "bg-purple-100" : ""}
                        `}
                      >
                        <item.icon
                          className={`w-5 h-5
                            ${item.color === "red" ? "text-red-600" : ""}
                            ${item.color === "orange" ? "text-orange-600" : ""}
                            ${item.color === "blue" ? "text-blue-600" : ""}
                            ${item.color === "purple" ? "text-purple-600" : ""}
                          `}
                        />
                      </div>
                      <h3
                        className={`font-bold
                          ${item.color === "red" ? "text-red-800" : ""}
                          ${item.color === "orange" ? "text-orange-800" : ""}
                          ${item.color === "blue" ? "text-blue-800" : ""}
                          ${item.color === "purple" ? "text-purple-800" : ""}
                        `}
                      >
                        {item.problem}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {item.solutions.map((solution, solutionIndex) => (
                        <li
                          key={solutionIndex}
                          className={`flex items-center gap-2 text-sm
                            ${item.color === "red" ? "text-red-700" : ""}
                            ${item.color === "orange" ? "text-orange-700" : ""}
                            ${item.color === "blue" ? "text-blue-700" : ""}
                            ${item.color === "purple" ? "text-purple-700" : ""}
                          `}
                        >
                          <ChevronRight className="w-4 h-4" />
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">نیاز به کمک دارید؟</h2>
              <p className="text-xl opacity-90 mb-8">
                تیم فنی ما آماده کمک به شما برای نصب ویجت است
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-blue-700"
                  asChild
                >
                  <a href="mailto:support@x-sme.ir">📧 support@x-sme.ir</a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-700"
                  asChild
                >
                  <a href="tel:+989123456789">📱 ۰۹۱۲-۳۴۵-۶۷۸۹</a>
                </Button>
              </div>
              <p className="text-sm opacity-75 mt-6">
                پشتیبانی رایگان برای نصب و راه‌اندازی ویجت
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WordPressGuide;
