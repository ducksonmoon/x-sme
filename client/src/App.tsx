import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "@layouts/MainLayout";
import Home from "@pages/Home";

// The homepage ships with the app entry so a second page download cannot
// strand the initial visit. Other pages load inside MainLayout's boundary.
const About = React.lazy(() => import("@pages/About"));
const Contact = React.lazy(() => import("@pages/Contact"));
const Services = React.lazy(() => import("@pages/Services"));
const Portfolio = React.lazy(() => import("@pages/Portfolio"));
const PortfolioDetail = React.lazy(() => import("@pages/PortfolioDetail"));
const Privacy = React.lazy(() => import("@pages/Privacy"));
const Terms = React.lazy(() => import("@pages/Terms"));

// Error pages
const NotFound = React.lazy(() => import("@pages/NotFound"));
const ServerError = React.lazy(() => import("@pages/ServerError"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="services" element={<Services />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="portfolio/:slug" element={<PortfolioDetail />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
