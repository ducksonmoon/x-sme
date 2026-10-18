import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpLeft, ArrowLeft, Menu, X, Mail } from "lucide-react";
import { CircleLogo, CircleMark } from "@/brand/circle";
import RouteContent from "@components/RouteContent";

const navigation = [
  { name: "خانه", href: "/" },
  { name: "راهکارها", href: "/services" },
  { name: "کارهای ما", href: "/portfolio" },
  { name: "دربارهٔ دایره", href: "/about" },
];

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    setOpen(false);
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) {
      target.scrollIntoView({ block: "start", behavior: "instant" });
      target.focus({ preventScroll: true });
    } else if (previousPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      main.current?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <div className="circle-site">
      <a className="site-skip" href="#main-content">
        رفتن به محتوای صفحه
      </a>
      <header className="site-header">
        <div className="site-container site-header__row">
          <Link
            to="/"
            className="site-home-link"
            aria-label="دایره، صفحهٔ اصلی"
          >
            <CircleLogo size="sm" showMark={false} />
          </Link>
          <nav className="site-desktop-nav" aria-label="ناوبری اصلی">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `site-nav-link${isActive ? " is-active" : ""}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
          <Link className="site-button site-header__cta" to="/contact">
            بیایید گفت‌وگو کنیم
            <ArrowUpLeft size={17} aria-hidden="true" />
          </Link>
          <button
            ref={menuButton}
            className="site-menu-button"
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            className="site-mobile-nav site-container"
            aria-label="ناوبری موبایل"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                end={item.href === "/"}
                to={item.href}
                onClick={() => setOpen(false)}
              >
                {item.name}
                <ArrowLeft size={18} aria-hidden="true" />
              </NavLink>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)}>
              شروع یک گفت‌وگو
              <ArrowUpLeft size={18} />
            </Link>
          </nav>
        )}
      </header>
      <main id="main-content" ref={main} tabIndex={-1}>
        <RouteContent />
      </main>
      <footer className="site-footer">
        <div className="site-container">
          {pathname !== "/contact" && (
            <div className="site-footer__invitation">
              <div>
                <span className="site-footer__eyebrow">
                  دایرهٔ بعدی، از یک گفت‌وگو شروع می‌شود.
                </span>
                <h2>
                  چه چیزی را
                  <br />
                  <span>با هم بسازیم؟</span>
                </h2>
              </div>
              <Link
                to="/contact"
                className="site-footer__circle"
                aria-label="شروع گفت‌وگو دربارهٔ پروژه"
              >
                <ArrowUpLeft size={48} />
                <span>شروع گفت‌وگو</span>
              </Link>
            </div>
          )}
          <div className="site-footer__grid">
            <div className="site-footer__brand">
              <CircleLogo theme="dark" showMark={false} />
              <p>
                اجزا را به یک سیستم تبدیل می‌کنیم.
                <br />
                وب، نرم‌افزار و راهکارهای هوشمند.
              </p>
            </div>
            <div>
              <span className="site-footer__label">در دایره</span>
              <nav aria-label="پیوندهای فوتر">
                {navigation.slice(1).map((item) => (
                  <Link key={item.href} to={item.href}>
                    {item.name}
                  </Link>
                ))}
                <Link to="/contact">ارتباط با ما</Link>
              </nav>
            </div>
            <div className="site-footer__contact">
              <span className="site-footer__label">یک خط ارتباط مستقیم</span>
              <a href="mailto:info@circlegroup.ir" dir="ltr">
                info@circlegroup.ir
                <Mail size={18} />
              </a>
              <span className="site-footer__location">
                تهران، ایران · برای کسب‌وکار شما
              </span>
              <CircleMark theme="dark" size={38} />
            </div>
          </div>
          <div className="site-footer__bottom">
            <span>
              © {new Date().toLocaleDateString("fa-IR", { year: "numeric" })}{" "}
              دایره
            </span>
            <div>
              <Link to="/privacy">حریم خصوصی</Link>
              <Link to="/terms">شرایط استفاده</Link>
            </div>
            <span dir="ltr">CIRCLE / PARTS INTO A WHOLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
