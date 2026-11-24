"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";


import ringLayer from "@assets/logo-layers/anel.webp";
import sceneryLayer from "@assets/logo-layers/cenario.webp";
import letteringLayer from "@assets/logo-layers/letras.webp";
import bikeLayer from "@assets/logo-layers/moto.webp";
import riderLayer from "@assets/logo-layers/piloto.webp";
import badgeLayer from "@assets/logo-layers/rj.webp";

type IntroLayer = {
  part: string;
  src: StaticImageData;
};

// Paint order, back to front. The entrance order lives in the CSS delays.
const layers: IntroLayer[] = [
  { part: "scenery", src: sceneryLayer },
  { part: "ring", src: ringLayer },
  { part: "lettering", src: letteringLayer },
  { part: "badge", src: badgeLayer },
  { part: "bike", src: bikeLayer },
  { part: "rider", src: riderLayer },
];

// The sequence waits for every layer, but never longer than this.
const LOAD_DEADLINE_MS = 2500;

export function LogoIntro() {
  const [isDone, setIsDone] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasWaitedLongEnough, setHasWaitedLongEnough] = useState(false);
  const isReady = loadedCount >= layers.length || hasWaitedLongEnough;

  useEffect(() => {
    const skip = () => setIsSkipped(true);
    const options = { once: true, passive: true };

    window.addEventListener("keydown", skip, options);
    window.addEventListener("wheel", skip, options);
    window.addEventListener("touchmove", skip, options);

    const loadDeadline = window.setTimeout(
      () => setHasWaitedLongEnough(true),
      LOAD_DEADLINE_MS,
    );

    return () => {
      window.clearTimeout(loadDeadline);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
  }, []);

  if (isDone) return null;

  return (
    <div
      aria-hidden
      className="logo-intro"
      data-ready={isReady ? "" : undefined}
      data-skipped={isSkipped ? "" : undefined}
      onClick={() => setIsSkipped(true)}
      onAnimationEnd={(event) => {
        if (event.animationName !== "logo-intro-exit") return;

        setIsDone(true);
      }}
    >
      <div className="logo-intro-mark">
        {layers.map((layer) => (
          <Image
            key={layer.part}
            src={layer.src}
            alt=""
            fill
            priority
            sizes="(max-width: 40rem) 64vw, 26rem"
            className="logo-intro-layer"
            data-part={layer.part}
            onLoad={() => setLoadedCount((count) => count + 1)}
          />
        ))}
      </div>
      <p className="logo-intro-name display">Scrambler RJ</p>
    </div>
  );
}
