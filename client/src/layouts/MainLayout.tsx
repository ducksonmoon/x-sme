import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useHref } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  Mail,
  ArrowRight,
  ChevronUp,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@components/ui/button";
import LogoMark from "@components/LogoMark";
import { cn } from "../utils/cn";

interface NavigationItem {
  name: string;
  href: string;
  badge?: string;
}

const MainLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const portfolioHref = useHref("/#portfolio");

  const navigation: NavigationItem[] = [
    { name: "خانه", href: "/" },
    { name: "خدمات", href: "/#services" },
    { name: "نمونه‌کارها", href: "/#portfolio" },
    { name: "درباره ما", href: "/about" },
    { name: "تماس با ما", href: "/contact" },
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
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-line-soft backdrop-blur-xl bg-paper/90">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <LogoMark />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-ink">مریخ</span>
                <span className="text-xs text-ink-faint font-medium">
                  وب، نرم‌افزار و هوش مصنوعی
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
                      ? "text-mars-dark bg-mars-tint"
                      : "text-ink-soft hover:text-mars-dark hover:bg-mars-tint/50"
                  )}
                >
                  {item.name}
                  {item.badge && (
                    <span className="bg-mars text-paper text-xs px-2 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-mars-tint rounded-lg -z-10"
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
                className="text-ink-soft hover:text-mars-dark hover:bg-mars-tint border border-transparent hover:border-mars/30 transition-all duration-300"
              >
                <a href={portfolioHref} className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  نمونه‌کارها
                </a>
              </Button>
              <Button
                asChild
                className="bg-mars text-paper hover:bg-[oklch(62%_0.15_35)] hover:text-paper transition-all duration-300"
              >
                <Link to="/contact" className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  شروع پروژه
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-mars-tint transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-ink-soft" />
              ) : (
                <Menu className="h-6 w-6 text-ink-soft" />
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
                className="md:hidden border-t border-line-soft py-4 backdrop-blur-xl bg-paper/95"
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
                            ? "text-mars-dark bg-mars-tint"
                            : "text-ink-soft hover:text-mars-dark hover:bg-mars-tint"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-3" />
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="bg-mars text-paper text-xs px-2 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="flex flex-col space-y-3 pt-4 border-t border-line-soft">
                    <Button
                      variant="ghost"
                      asChild
                      className="justify-start text-ink-soft hover:text-mars-dark hover:bg-mars-tint"
                    >
                      <a
                        href={portfolioHref}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center"
                      >
                        <Zap className="w-4 h-4 mr-3" />
                        نمونه‌کارها
                      </a>
                    </Button>
                    <Button asChild className="bg-mars text-paper">
                      <Link
                        to="/contact"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center"
                      >
                        <ArrowRight className="w-4 h-4 mr-3" />
                        شروع پروژه
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
      <footer className="bg-paper border-t border-line-soft mt-auto">
        <div className="container mx-auto px-4 max-w-7xl py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <LogoMark animated={false} />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-ink">مریخ</span>
                  <span className="text-xs text-ink-faint">
                    وب، نرم‌افزار و هوش مصنوعی
                  </span>
                </div>
              </div>
              <p className="text-ink-soft mb-6 leading-relaxed max-w-md">
                طراحی و توسعه وب‌سایت، نرم‌افزار، API و راهکارهای هوش مصنوعی
                برای کسب‌وکارها؛ شریک فنی شما از ایده تا اجرا.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-ink">
                دسترسی سریع
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "صفحه اصلی", href: "/" },
                  { name: "خدمات", href: "/#services" },
                  { name: "نمونه‌کارها", href: "/#portfolio" },
                  { name: "درباره ما", href: "/about" },
                  { name: "تماس با ما", href: "/contact" },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-ink-soft hover:text-mars-dark transition-colors flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-mars" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <h4 className="text-sm font-semibold mb-6 text-ink">
                ارتباط با ما
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center text-ink-soft pt-2">
                  <Phone className="w-4 h-4 mr-2 text-mars" />
                  <span className="text-sm">۰۲۱-۱۲۳۴۵۶۷۸</span>
                </li>
                <li className="flex items-center text-ink-soft">
                  <Mail className="w-4 h-4 mr-2 text-mars" />
                  <span className="text-sm">info@merikh.co</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-line-soft mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-ink-faint text-sm mb-4 md:mb-0">
                © ۱۴۰۳ مریخ. تمامی حقوق محفوظ است.
              </div>
              <div className="flex space-x-6 space-x-reverse text-sm">
                <a
                  href="/privacy"
                  className="text-ink-faint hover:text-ink transition-colors flex items-center group"
                >
                  حریم خصوصی
                  <ExternalLink className="w-3 h-3 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <a
                  href="/terms"
                  className="text-ink-faint hover:text-ink transition-colors flex items-center group"
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
            className="fixed bottom-8 right-8 w-12 h-12 bg-mars text-paper rounded-xl shadow-lg hover:scale-110 transition-all duration-300 z-40"
          >
            <ChevronUp className="w-5 h-5 mx-auto" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
