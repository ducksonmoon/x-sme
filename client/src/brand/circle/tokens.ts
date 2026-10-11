import palette from "./palette.json";

/** Approved Persian circular signature: one palette for site and exports. */
export const circleColors = palette;
export const circleHeroBackground = palette.petrol;
export const circleDesign = {
  spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96],
  radius: { control: 8, card: 16, pill: 999 },
  type: { caption: 12, body: 16, lead: 20, heading: 32, display: 48 },
  fontFamily: "'Vazirmatn', Tahoma, Arial, sans-serif",
  transition: "160ms ease-out",
} as const;
