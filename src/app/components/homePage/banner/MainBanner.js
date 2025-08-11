'use client';

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Promises } from "../atoms/Promises";

export default function MainBanner() {
  const textRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const source = textRef.current;
      const target = document.getElementById("navbarTextTarget");

      if (!source || !target) return;

      // Fade out the original text
      source.style.transition = "opacity 0.3s ease-out";
      source.style.opacity = "0";

      // Clone the original and animate it
      const clone = source.cloneNode(true);
      const sourceRect = source.getBoundingClientRect();

      Object.assign(clone.style, {
        position: "fixed",
        left: `${sourceRect.left}px`,
        top: `${sourceRect.top}px`,
        margin: "0",
        zIndex: "9999",
        fontSize: "5rem",
        fontWeight: "bold",
        color: "white",
        transition: "all 1s ease-in-out",
        transformOrigin: "top left",
        pointerEvents: "none",
        whiteSpace: "nowrap"
      });

      document.body.appendChild(clone);

      const targetRect = target.getBoundingClientRect();

      requestAnimationFrame(() => {
        Object.assign(clone.style, {
          left: `${targetRect.left}px`,
          top: `${targetRect.top}px`,
          opacity: "0.5",
          transform: "scale(0.6)"
        });
      });

      setTimeout(() => {
        target.style.opacity = "1";
        clone.remove();

        // Start typing the follow-up message
        const phrase = "Handmade Products, by Norwegians, in Norway.";
        const container = revealRef.current;
        container.innerHTML = "";

        let i = 0;
        const isMobile = window.innerWidth < 768;
        const baseSpeed = isMobile ? 30 : 40;
        const speed = Math.round(baseSpeed * 1.4); // 40% slower

        const typingInterval = setInterval(() => {
          if (i < phrase.length) {
            const span = document.createElement("span");
            span.textContent = phrase[i];
            span.style.opacity = "0";
            span.style.transition = "opacity 0.3s ease";
            container.appendChild(span);
            requestAnimationFrame(() => {
              span.style.opacity = "1";
            });
            i++;
          } else {
            clearInterval(typingInterval);
          }
        }, speed);
      }, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-10">
      <div className="mainBanner-cover bg-cover bg-center w-full min-h-[40vw] relative flex flex-col items-center justify-center overflow-visible">
        <Image
          src="https://en.visitbergen.com/imageresizer/?image=%2Fdmsimgs%2F1_Highland_2400x1200_98407125.jpg&action=ProductDetailExtraLargeNew"
          alt="Main Banner"
          fill
          priority
          className="object-cover z-0"
        />

        <h2
          ref={textRef}
          className="text-white p-12 text-8xl mb-0 z-10 relative [@media(min-width:700px)and(max-width:1270px)]:text-[7rem] [@media(min-width:2000px)]:text-[10rem]"
        >
          NORYA
        </h2>

        <div
          ref={revealRef}
          className="text-white text-3xl sm:text-4xl text-center p-4 z-20 md:text-6xl
                   max-w-496
                   min-w-[60vw]
                   [@media(min-width:700px)and(max-width:1270px)]:min-w-[70vw]
                   [@media(min-width:2000px)]:min-w-[50vw]
                   [@media(min-width:700px)and(max-width:1270px)]:text-[3.5rem]
                   [@media(min-width:2000px)]:text-[5rem]"
        ></div>

        {/* Promises anchored near bottom of banner */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-40">
          <Promises />
        </div>
      </div>
    </div>
  );
}