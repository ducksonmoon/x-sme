# Circle (دایره) brand assets

Reusable pieces of the دایره brand identity. Everything here is plain React +
Tailwind (the same tokens as `tailwind.config.js`'s `navy`/`gold` colors and
`src/styles/index.css`) with no dependency on the rest of this app, so a
whole file can be copied into a new product's repo as-is.

```ts
import {
  CircleMark,
  HeroGlow,
  WebsiteCredit,
  SplashScreen,
  AboutCredit,
  SidebarCredit,
} from "@/brand/circle";
```

## Logo

- **`CircleMark`** — the logo mark. `variant="full"` (textured double stroke)
  for anything ≥32px — header, hero, print. `variant="simple"` (single clean
  stroke) for favicons and other small/tight spots. `theme="dark"` swaps in
  the brighter gold/coral for use on a navy background. `animated` adds the
  slow rotation used in the hero and splash screen.
- **`HeroGlow`** — the navy gradient + drifting color blobs + grain overlay
  used behind the home hero. Wrap any content in it for a matching hero
  section on a new page.

## "Built by دایره" credit — pick by what you're building

**Websites built for a client** — `WebsiteCredit`:

```tsx
<WebsiteCredit variant="footer-light" /> // inline text credit, light footer
<WebsiteCredit variant="footer-dark" />  // inline text credit, dark footer
<WebsiteCredit variant="floating" />     // self-contained dark pill, any page corner
```

**Apps and dashboards** — from `SoftwareCredit`:

```tsx
<SplashScreen showLoadingDots />          // full-bleed boot/splash screen
<AboutCredit version="1.4.0" />           // "About" screen or settings-page card
<SidebarCredit />                         // compact row for a dark sidebar's footer
```

None of these are used on دایره's own site — it's دایره's own homepage, so a
"built by دایره" credit doesn't apply to itself. Wire them into the *next*
product or client site instead.

## Colors and type

`tokens.ts` exports the raw color/gradient strings (`circleColors`,
`circleGradient`, `circleHeroBackground`) for anywhere you need them outside
a Tailwind class, e.g. inline SVG or a `style` prop. The full color, type, and
component reference — including the favicon/app-icon set and social share
image — is the "Circle Brand Guide" design canvas (ask for the link if you
don't have it).
