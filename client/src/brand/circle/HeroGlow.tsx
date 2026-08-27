import React from "react";
import { circleHeroBackground } from "./tokens";

interface HeroGlowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Atmospheric wrapper for a hero section in the "Circle" brand: a warm
 * radial-gradient glow over a navy base, two drifting color blobs, and a
 * faint grain overlay. Renders its children on top, positioned normally.
 */
const HeroGlow: React.FC<HeroGlowProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: circleHeroBackground }}
    >
      <div
        className="pointer-events-none absolute -top-36 -right-24 h-[520px] w-[520px] rounded-full"
        style={{
          background: "oklch(74% 0.14 82 / 40%)",
          filter: "blur(90px)",
          animation: "circle-blob-drift-1 14s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-56 h-[460px] w-[460px] rounded-full"
        style={{
          background: "oklch(68% 0.16 38 / 30%)",
          filter: "blur(100px)",
          animation: "circle-blob-drift-2 17s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute top-28 -left-28 h-[340px] w-[340px] rounded-full"
        style={{ background: "oklch(55% 0.09 200 / 20%)", filter: "blur(90px)" }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0.05, mixBlendMode: "overlay" }}
      >
        <filter id="circle-grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#circle-grain)" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
};

export default HeroGlow;
