import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import LoadingSpinner from "@components/LoadingSpinner";
import MainLayout from "@layouts/MainLayout";

// Lazy load pages for better performance
const Home = React.lazy(() => import("@pages/Home"));
const About = React.lazy(() => import("@pages/About"));
const Contact = React.lazy(() => import("@pages/Contact"));

// Error pages
const NotFound = React.lazy(() => import("@pages/NotFound"));
const ServerError = React.lazy(() => import("@pages/ServerError"));

function App() {
  return (
    <>
      <Helmet>
        <title>وب‌سایت شرکت - طراحی وب، نرم‌افزار و راهکارهای هوش مصنوعی</title>
        <meta
          name="description"
          content="طراحی و توسعه وب‌سایت، نرم‌افزار، API و راهکارهای هوش مصنوعی برای کسب‌وکارها"
        />
      </Helmet>

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Error routes */}
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
