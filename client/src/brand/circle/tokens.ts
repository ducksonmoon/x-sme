// Color tokens for the "Circle" (دایره) artistic brand concept.
// Kept separate from tailwind.config.js's navy/mars tokens so this can be
// reviewed and reused without touching the live مریخ brand.
export const circleColors = {
  gold: "oklch(74% 0.12 82)",
  goldBright: "oklch(80% 0.14 85)",
  coral: "oklch(66% 0.16 40)",
  coralBright: "oklch(70% 0.17 38)",
  navyDeep: "oklch(11% 0.03 258)",
  navyBase: "oklch(15.5% 0.045 258)",
  navyPlum: "oklch(21% 0.05 280)",
} as const;

export const circleGradient = `linear-gradient(90deg, ${circleColors.goldBright}, ${circleColors.coralBright})`;

export const circleHeroBackground = `radial-gradient(120% 100% at 70% 15%, ${circleColors.navyPlum} 0%, ${circleColors.navyBase} 55%, ${circleColors.navyDeep} 100%)`;
