# circlegroup.ir

Source for [circlegroup.ir](https://circlegroup.ir) — the website of **دایره (Circle)**: web, software and AI solutions for businesses.

A static, Persian (RTL) single-page app built with React 19, TypeScript, Vite and Tailwind CSS, hosted on GitHub Pages.

## Development

```bash
cd client
npm ci
npm run dev        # http://localhost:3000
npm run build      # type-check + production build into client/dist
npm run preview    # serve the production build locally
```

## Structure

```
client/
  public/            static files (CNAME, favicons, manifest, og-image, 404.html SPA redirect)
  src/
    pages/           Home, About, Services, Portfolio, PortfolioDetail, Contact, Privacy, Terms, error pages
    layouts/         MainLayout (header + footer)
    data/site.ts     site content: services, portfolio items, contact details
    brand/circle/    Circle brand mark, tokens and reusable "built by دایره" credits
    components/      shared UI (button, card, input, badge, …)
.github/workflows/deploy-pages.yml   builds client/ and deploys to GitHub Pages on push to main
```

## Deployment

Every push to `main` builds `client/` and publishes `client/dist` to GitHub Pages.
The custom domain is set by `client/public/CNAME` (`circlegroup.ir`); its DNS must point at GitHub Pages
and the same domain should be set under the repository's **Settings → Pages**.

The contact form posts to Formspree (`@formspree/react`), so the site needs no backend.
