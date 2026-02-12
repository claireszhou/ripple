"use client";

import { useEffect, useState } from "react";

const VIEWBOX = 1200;
const RIPPLE_SOURCES = [
  { x: 600, y: 600, baseR: 20, step: 18, layers: 20, scrollTrigger: 0 },
  { x: 180, y: 280, baseR: 20, step: 15, layers: 18, scrollTrigger: 0 },
  { x: 950, y: 120, baseR: 20, step: 20, layers: 16, scrollTrigger: 0 },
  { x: 220, y: 880, baseR: 20, step: 18, layers: 18, scrollTrigger: 0 },
  { x: 1020, y: 720, baseR: 20, step: 15, layers: 20, scrollTrigger: 0 },
  { x: 140, y: 550, baseR: 20, step: 16, layers: 19, scrollTrigger: 0 },
  { x: 820, y: 950, baseR: 20, step: 18, layers: 17, scrollTrigger: 0 },
  { x: 450, y: 200, baseR: 20, step: 16, layers: 18, scrollTrigger: 500 },
  { x: 750, y: 400, baseR: 20, step: 20, layers: 16, scrollTrigger: 500 },
  { x: 280, y: 650, baseR: 20, step: 15, layers: 20, scrollTrigger: 800 },
  { x: 900, y: 800, baseR: 20, step: 18, layers: 17, scrollTrigger: 800 },
  { x: 120, y: 400, baseR: 20, step: 22, layers: 15, scrollTrigger: 1100 },
  { x: 1050, y: 300, baseR: 20, step: 15, layers: 19, scrollTrigger: 1100 },
  { x: 500, y: 950, baseR: 20, step: 18, layers: 18, scrollTrigger: 1400 },
  { x: 700, y: 150, baseR: 20, step: 16, layers: 20, scrollTrigger: 1400 },
];

export function RippleBackground() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    function handleScroll() {
      setScrollY(window.scrollY);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const scale = 1 + Math.min(scrollY * 0.0008, 2);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="ripple-soften" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#ripple-soften)">
          {RIPPLE_SOURCES.map((source, i) => {
            const fadeIn = source.scrollTrigger === 0
              ? 1
              : Math.min(1, Math.max(0, (scrollY - source.scrollTrigger) / 300));
            return (
            <g
              key={i}
              transform={`translate(${source.x} ${source.y}) scale(${scale})`}
              style={{ opacity: fadeIn }}
            >
              <circle
                cx={0}
                cy={0}
                r={5}
                fill="none"
                stroke="rgb(7 89 133)"
                strokeWidth={0.5}
                style={{ opacity: Math.max(0.03, 0.35) }}
              />
              {(() => {
                const circles = [];
                let r = source.baseR;
                let stepMultiplier = 1;
                for (let j = 0; j < source.layers; j++) {
                  if (j > 0) {
                    stepMultiplier = 0.82 + 0.36 * Math.sin(j * 1.2 + i * 0.5);
                    const radialScale = 1 + 0.4 * Math.pow(j / source.layers, 0.8);
                    r += source.step * stepMultiplier * radialScale * 1.3;
                  }
                  const t = source.layers > 1 ? j / (source.layers - 1) : 0;
                  const baseOpacity = 0.35 * (1 - t * t) - t * 0.05;
                  const spacingFactor = (stepMultiplier - 0.46) / 0.72;
                  const opacity = baseOpacity * (0.72 + 0.56 * spacingFactor);
                  const strokeColor = `rgb(${Math.round(7 + t * 179)} ${Math.round(89 + t * 141)} ${Math.round(133 + t * 120)})`;
                  circles.push(
                    <circle
                      key={j}
                      cx={0}
                      cy={0}
                      r={r}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={0.5}
                      style={{ opacity: Math.max(0.03, Math.min(0.5, opacity)) }}
                    />
                  );
                }
                return circles;
              })()}
            </g>
          );
          })}
        </g>
      </svg>
    </div>
  );
}
