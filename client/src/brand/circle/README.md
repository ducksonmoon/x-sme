# دایره — کیت هویت، لوگو و سیستم طراحی

این کیت مربوط به **لوگوی دومِ منتخب، الهام‌گرفته از حرف «ه»** است: یک فرم گرد با دو فضای داخلی. فایل‌های نهایی از مسیرهای SVG و حروف برداری ساخته شده‌اند؛ تصویر تولیدشده برش یا تبدیل به لوگو نشده است.

نشان در `mark.json` تعریف می‌شود. `wordmark.json` نام فارسی را با همان نشان برای «ه» نهایی ترکیب می‌کند؛ نقطه‌های «ی» در نسخهٔ روشن مسی هستند. حروف نام به مسیر برداری تبدیل شده‌اند و برای نمایش به فونت نصب‌شده وابسته نیستند. فونت رابط و توضیحات، Vazirmatn با مجوز OFL است.

## پالت و نقش رنگ‌ها

| رنگ           | کد        | نقش                                             |
| ------------- | --------- | ----------------------------------------------- |
| نفتی          | `#123C3D` | نشان روشن، متن، دکمهٔ اصلی و سطح تیره           |
| کاغذی گرم     | `#F4F1E8` | زمینهٔ اصلی، نشان معکوس و متن روی نفتی          |
| مسی مات       | `#B65B3B` | نقطه‌های نام، خط و جزئیات تزئینی محدود          |
| نفتی hover    | `#1B4D4C` | حالت اشاره‌گر دکمهٔ اصلی                        |
| زمینهٔ کم‌رنگ | `#E5EDE6` | badge و حالت اشاره‌گر عمل دوم                   |
| متن ثانویه    | `#526763` | توضیحات و کپشن روی زمینهٔ روشن                  |
| مرز           | `#CED8CE` | کارت و جداکننده؛ مرز ورودی قابل تعامل `#79918A` |

در یک صفحهٔ روشن، نسبت شروع پیشنهادی **۶۵٪ کاغذی، ۳۰٪ نفتی، ۵٪ مسی** است؛ این نسبت قانون ثابت برای هر صفحه نیست. مسی رنگ اصلی دکمه و پیام خطا نیست. متن کاغذی روی نفتی و متن نفتی روی کاغذی کنتراست **10.69:1** دارند. برای متن کوچک از رنگ مسی استفاده نکنید. وضعیت خطا مستقل از رنگ برند و با پیام متنی مشخص می‌شود.

منبع پالت `palette.json` است. هنگام تغییر پالت، متغیرهای scoped در `circle.css` و توکن‌های معنایی `src/styles/index.css` را هم هماهنگ کنید؛ Tailwind از همان JSON می‌خواند.

## لوگو و حریم

- حریم آزاد: حداقل یک‌چهارم عرض نشان از عناصر اطراف.
- حداقل اندازهٔ نشان مستقل: ۱۶px؛ در کنار نوشته و امضا، ۲۰ تا ۴۰px.
- `CircleLogo size="sm"`: مناسب سربرگ؛ `md`: مناسب فوتر؛ `lg`: ارائه و صفحهٔ شروع.
- فارسی نام اصلی است؛ `CIRCLE GROUP` مکمل است. فاصلهٔ حروف فارسی تغییر نمی‌کند.
- نسخهٔ روشن: نفتی؛ نسخهٔ تیره: کاغذی. نسخهٔ تک‌رنگ سیاه یا سفید برای کاربردهای محدود موجود است.
- نشان را نچرخانید، آینه‌ای نکنید، نکشید و به آن سایه، بافت یا گرادیان اضافه نکنید.
- `variant="full"` و `simple` برای سازگاری API حفظ شده‌اند و اکنون یک سیلوئت ثابت دارند.
- `animated` فقط ورود کوتاه انجام می‌دهد و تنظیم `prefers-reduced-motion` را رعایت می‌کند.

## تایپوگرافی و چیدمان

Vazirmatn برای فارسی و لاتین، با fallback به Tahoma و Arial. فایل‌های WOFF2 و مجوز در `fonts/` همراه کیت هستند.

| کاربرد      | اندازه               | وزن / فاصلهٔ خط  |
| ----------- | -------------------- | ---------------- |
| متن بدنه    | ۱۶px                 | ۴۰۰ / ۱٫۸        |
| توضیح       | ۱۲px                 | ۴۰۰ تا ۶۰۰ / ۱٫۷ |
| متن برجسته  | ۲۰px                 | ۴۰۰ تا ۶۰۰ / ۱٫۷ |
| تیتر        | ۳۲px                 | ۷۰۰ / ۱٫۵        |
| تیتر اصلی   | ۴۸px، در موبایل ۳۲px | ۷۰۰ / ۱٫۵        |
| رابط و دکمه | ۱۴ تا ۱۶px           | ۶۰۰ تا ۷۰۰       |

فاصله‌ها: **۴، ۸، ۱۲، ۱۶، ۲۴، ۳۲، ۴۸، ۶۴، ۹۶px**. کنترل‌ها حداقل ۴۴px ارتفاع، گوشهٔ کنترل ۸px، کارت ۱۶px، خط مرزی ۱px. حرکت معمول ۱۶۰ms، ورود نشان ۳۲۰ms؛ وضعیت فوکوس صفحه‌کلید همیشه دیده می‌شود.

## کامپوننت‌های React

این پوشه را با ساختار `fonts/` به پروژهٔ React کپی کنید. به Tailwind، router، کتابخانهٔ آیکون یا وضعیت سراسری وابسته نیست. bundler باید import فایل‌های JSON و CSS را پشتیبانی کند. React 18 یا جدیدتر مناسب است؛ پروژهٔ فعلی با React 19 اجرا می‌شود.

```tsx
import {
  CircleMark, CircleLogo, WebsiteCredit,
  CircleButton, CircleInput, CircleCard, CircleBadge,
  SplashScreen, AboutCredit, SidebarCredit,
  circleColors, circleDesign,
} from "./brand/circle";

// امضای اصلی؛ href را در پروژهٔ میزبان اضافه کنید.
<a href="https://circlegroup.ir">
  <CircleLogo size="md" />
</a>

// نسخهٔ تیره روی سطح نفتی
<CircleLogo theme="dark" size="lg" orientation="stacked" />

// آیکون مستقل با نام دسترس‌پذیر
<CircleMark size={32} label="دایره" />

// رنگ تک‌رنگ سفارشی، فقط با کنتراست مناسب
<CircleMark size={24} color="#000000" label="دایره" />
```

`CircleLogo`: `theme`, `size`, `orientation`, `showEnglish`, `tagline`, `className`.

`CircleMark`: `theme`, `variant`, `size`, `color`, `label`, `animated`, `className`. کنار نام قابل مشاهده، `label` را ندهید تا نام تکراری برای screen reader ایجاد نشود.

### فوتر وب‌سایت‌های مشتری

```tsx
<WebsiteCredit variant="footer-light" />
<WebsiteCredit variant="footer-dark" />
<WebsiteCredit variant="floating" />
```

متن امضا **«طراحی و توسعه توسط دایره»** است. لینک پیش‌فرض `https://circlegroup.ir` است؛ `href` و `className` قابل تنظیم‌اند. نسخهٔ روشن را روی سطح روشن و نسخهٔ تیره را روی سطح نفتی/تیره استفاده کنید. `floating` یک کپسول با زمینهٔ خودش است، اما مکان آن ثابت یا شناور روی viewport نیست؛ محل قرارگیری را سایت میزبان تعیین می‌کند.

امضا کوچک و پس از محتوای مشتری باشد؛ هویت مشتری اولویت دارد. امضای «ساخته‌شده توسط دایره» را در سایت خود دایره استفاده نکنید.

### امضای نرم‌افزار

```tsx
// صفحهٔ شروع، فقط اگر بارگذاری واقعی وجود دارد
<SplashScreen showLoadingDots />

// بخش درباره یا تنظیمات
<AboutCredit version="1.0.0" />
<AboutCredit theme="dark" version="1.0.0" />

// پایین سایدبار
<SidebarCredit theme="dark" />
<SidebarCredit theme="light" />
```

`AboutCredit` نسخه را فقط در صورت وجود نمایش می‌دهد. لینک خروجی `noopener noreferrer` دارد. هویت اصلی نرم‌افزار مشتری را حفظ کنید؛ امضای دایره نقش سازنده را دارد.

## اجزای HTML و CSS مستقل

اجزای رابط به‌صورت React هم آماده‌اند و به wrapper نیاز ندارند:

```tsx
<CircleButton>شروع پروژه</CircleButton>
<CircleButton variant="secondary">جزئیات</CircleButton>
<CircleButton disabled>غیرفعال</CircleButton>
<CircleBadge>راهکار سفارشی</CircleBadge>
<CircleCard>محتوای کارت</CircleCard>
<label htmlFor="project">نام پروژه</label>
<CircleInput id="project" />
```

این اجزا props استاندارد HTML، رویدادها، disabled و خصوصیات ARIA را می‌پذیرند. دکمه و ورودی ref هم می‌پذیرند. نوع پیش‌فرض دکمه `button` است؛ در فرم `type="submit"` را صریح بدهید.

فایل `circle.css` و پوشهٔ `fonts` را با همان مسیر نسبی منتشر کنید. کلاس‌ها scoped هستند و سبک عمومی سایت میزبان را reset نمی‌کنند. SVGهای آمادهٔ `public/brand` به فونت خارجی وابسته نیستند.

```html
<link rel="stylesheet" href="/brand/circle.css" />

<div class="circle-system" dir="rtl">
  <button class="circle-button">شروع پروژه</button>
  <button class="circle-button circle-button--secondary">جزئیات</button>
  <button class="circle-button" disabled>غیرفعال</button>
  <span class="circle-badge">راهکار سفارشی</span>
  <article class="circle-card">محتوای کارت</article>
  <label for="project">نام پروژه</label>
  <input id="project" class="circle-input" />
</div>

<!-- امضای فوتر برای سایت بدون React -->
<a href="https://circlegroup.ir" target="_blank" rel="noopener noreferrer">
  <img
    src="/brand/website-credit-light.svg"
    alt="طراحی و توسعه توسط دایره"
    width="230"
  />
</a>

<!-- امضای نرم‌افزار برای میزبان بدون React -->
<a href="https://circlegroup.ir" target="_blank" rel="noopener noreferrer">
  <img
    src="/brand/software-signature-light.svg"
    alt="نرم‌افزار طراحی و توسعه یافته توسط دایره"
  />
</a>
```

در صورت خطا، از `aria-invalid="true"`، پیام توضیحی و `aria-describedby` استفاده کنید. دسترس‌پذیری صفحهٔ کامل به ساختار و رنگ‌های میزبان هم وابسته است.

## فایل‌های قابل استفاده

در `public/brand/`:

- `mark-petrol.svg`, `mark-paper.svg`, `mark-black.svg`, `mark-white.svg`
- `logo-light.svg`, `logo-dark.svg`, `logo-black.svg`, `logo-white.svg` — نام فارسی و CIRCLE GROUP؛ حروف به outline تبدیل شده‌اند.
- `website-credit-light.svg`, `website-credit-dark.svg`, `website-credit-pill.svg` و نسخه‌های سیاه/سفید
- `software-signature-light.svg`, `software-signature-dark.svg`
- `app-icon.svg`, `favicon.svg`

## بازتولید و راهنمای بصری

از مسیر `client/`:

```bash
# وابستگی‌های فقط ابزار صادرات، در یک محیط Python جدا
python3 -m venv /tmp/circle-brand-export
/tmp/circle-brand-export/bin/pip install -r scripts/brand-assets-requirements.txt
/tmp/circle-brand-export/bin/python scripts/export-brand.py

# ساخت راهنمای بصری، جدا از مسیرهای سایت عمومی
./node_modules/.bin/vite build --config vite.config.brand.ts

# بررسی سایت اصلی
npm run build
```

راهنمای تعاملی در حالت توسعه با `brand-guide.html` در دسترس است. این صفحه یک مسیر داخل سایت شرکت نیست و در build اصلی منتشر نمی‌شود. خروجی `brand-kit/` جداگانه و ignored است.

فایل‌های PNG/ICO سایت، نسخه‌های رندرشدهٔ همان SVG هستند؛ تغییر نشان مستلزم تازه‌سازی آن خروجی‌ها نیز هست. همراه‌کردن `fonts/OFL.txt` هنگام توزیع فونت الزامی است.
