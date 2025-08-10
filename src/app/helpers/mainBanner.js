'use client';

import { useEffect, useRef } from "react";
import Image from "next/image";

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
        }, 60); // speed per character
      }, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-10">
      <div className="mainBanner-cover bg-cover bg-center w-full min-h-[40vw] relative flex flex-col items-center justify-center overflow-visible">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/norland-a7730.appspot.com/o/images%2Focean%20traveller%20v%C3%A5gnes%20troms%C3%B8%20northern%20spirit.jpg?alt=media&token=19828aad-263c-4cf2-9cd4-455253c5a3d7"
          alt="Main Banner"
          fill
          priority
          className="object-cover z-0"
        />
        <h2
          ref={textRef}
          className="text-white p-12 text-8xl mb-0 z-10 relative"
        >
          NORYA
        </h2>
        <div
          ref={revealRef}
          className="text-white text-xl mt-6 text-center z-20"
        ></div>
      </div>
    </div>
  );
}