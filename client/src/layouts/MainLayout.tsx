import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Globe,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Linkedin,
  ArrowRight,
  ChevronUp,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "../utils/cn";
import { useLanguage } from "../providers/LanguageProvider";

interface NavigationItem {
  name: string;
  href: string;
  badge?: string;
}

const MainLayout: React.FC = () => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  const navigation: NavigationItem[] = [
    { name: t("nav.features"), href: "/features" },
    { name: t("nav.pricing"), href: "/pricing" },
    { name: "مستندات", href: "/widget-docs" },
    { name: "WordPress", href: "/widget-docs#wordpress-guide", badge: "ویژه" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-xl bg-white/80 shadow-lg shadow-blue-500/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/25">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  X-SME
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  سامانه رزرو هوشمند
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg flex items-center gap-2",
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                  )}
                >
                  {item.name}
                  {item.badge && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="ghost"
                asChild
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all duration-300"
              >
                <Link to="/widget-demo" className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  {t("home.hero.try_demo")}
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
              >
                <Link to="/auth/login" className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {t("auth.login")}
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-blue-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden border-t border-gray-200/50 py-4 backdrop-blur-xl bg-white/90"
              >
                <nav className="flex flex-col space-y-2">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl",
                          isActive(item.href)
                            ? "text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-3" />
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200/50">
                    <Button
                      variant="ghost"
                      asChild
                      className="justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Link
                        to="/widget-demo"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center"
                      >
                        <Zap className="w-4 h-4 mr-3" />
                        {t("home.hero.try_demo")}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    >
                      <Link
                        to="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center"
                      >
                        <ArrowRight className="w-4 h-4 mr-3" />
                        {t("auth.login")}
                      </Link>
                    </Button>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        <div className="container mx-auto px-4 max-w-7xl py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    X-SME
                  </span>
                  <span className="text-xs text-gray-400">
                    سامانه رزرو هوشمند
                  </span>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                بهترین سامانه رزرو آنلاین برای کسب‌وکارهای خدماتی. مدیریت آسان
                نوبت‌ها، پیگیری مشتریان و افزایش درآمد.
              </p>

              {/* Social Media */}
              <div className="flex space-x-4 space-x-reverse">
                {[
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                دسترسی سریع
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "صفحه اصلی", href: "/" },
                  { name: "امکانات", href: "/features" },
                  { name: "تعرفه‌ها", href: "/pricing" },
                  { name: "مستندات ویجت", href: "/widget-docs" },
                  {
                    name: "راهنمای WordPress",
                    href: "/widget-docs#wordpress-guide",
                  },
                  { name: "تماس با ما", href: "/contact" },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-blue-400" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                پشتیبانی
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "راهنمای استفاده", href: "/help" },
                  { name: "سوالات متداول", href: "/faq" },
                  { name: "پشتیبانی فنی", href: "/support" },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-blue-400" />
                      {item.name}
                    </a>
                  </li>
                ))}
                <li className="flex items-center text-gray-300 pt-2">
                  <Phone className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-sm">۰۲۱-۱۲۳۴۵۶۷۸</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-sm">support@x-sme.ir</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © ۱۴۰۳ X-SME سامانه رزرو آنلاین. تمامی حقوق محفوظ است.
              </div>
              <div className="flex space-x-6 space-x-reverse text-sm">
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  حریم خصوصی
                  <ExternalLink className="w-3 h-3 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors flex items-center group"
                >
                  شرایط استفاده
                  <ExternalLink className="w-3 h-3 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-110 transition-all duration-300 z-40"
          >
            <ChevronUp className="w-5 h-5 mx-auto" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
