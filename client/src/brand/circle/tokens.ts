// Color tokens for the "Circle" (دایره) brand's gold/coral accent system.
// Kept separate from tailwind.config.js's "gold" token (used for small UI
// accents like icons and tags) since these also cover the coral half of the
// hero gradient and the dark navy hero background, which "gold" alone doesn't.
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
