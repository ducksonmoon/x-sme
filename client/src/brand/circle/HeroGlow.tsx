import React from "react";
import "./circle.css";

interface HeroGlowProps {
  children: React.ReactNode;
  className?: string;
}

/** Flat petrol is the dark surface; the mark provides the visual focus. */
const HeroGlow: React.FC<HeroGlowProps> = ({ children, className = "" }) => (
  <div className={`circle-hero ${className}`}>
    <div className="circle-hero__content">{children}</div>
  </div>
);

export default HeroGlow;
