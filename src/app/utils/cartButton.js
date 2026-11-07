"use client";

import { useRef, useState } from "react";
import { useCart } from "react-use-cart";

const CART_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

function getVisibleCartTarget() {
  return Array.from(document.querySelectorAll("[data-cart-animation-target]")).find(
    (target) => {
      const rect = target.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      );
    }
  );
}

function animateProductToCart(button, product) {
  const buttonRect = button.getBoundingClientRect();
  const startX = buttonRect.left + buttonRect.width / 2;
  const startY = buttonRect.top + buttonRect.height / 2;
  const cartTarget = getVisibleCartTarget();
  const cartRect = cartTarget?.getBoundingClientRect();
  const endX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth - 32;
  const endY = cartRect ? cartRect.top + cartRect.height / 2 : 32;
  const midpointX = startX + (endX - startX) * 0.56;
  const midpointY = startY + (endY - startY) * 0.56 - 72;
  const image = product.images?.find(
    (url) => typeof url === "string" && !url.startsWith("blob:")
  );

  const flyer = document.createElement("div");
  flyer.setAttribute("aria-hidden", "true");
  flyer.style.cssText = `
    position: fixed;
    left: ${startX}px;
    top: ${startY}px;
    width: 124px;
    height: 144px;
    padding: 5px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    background: #f5f6f4;
    box-shadow: 0 20px 52px rgba(10,35,66,.2), 0 3px 10px rgba(10,35,66,.08);
    pointer-events: none;
    z-index: 9999;
    clip-path: polygon(0 12%,12% 0,38% 0,62% 0,88% 0,100% 12%,100% 38%,100% 62%,100% 88%,88% 100%,62% 100%,38% 100%,12% 100%,0 88%,0 62%,0 38%);
    transform: translate(-50%, -50%) scale(.72) rotate(-4deg);
    opacity: 0;
  `;

  if (image) {
    const imageElement = document.createElement("img");
    imageElement.src = image;
    imageElement.alt = "";
    imageElement.draggable = false;
    imageElement.style.cssText = "width:100%;height:100%;object-fit:cover;";
    flyer.appendChild(imageElement);
  } else {
    flyer.textContent = product.name || "";
    flyer.style.cssText += `
      display: flex;
      align-items: center;
      justify-content: center;
      color: #16354a;
      font: 500 13px/1.35 Arial, sans-serif;
      text-align: center;
    `;
  }

  document.body.appendChild(flyer);

  const animation = flyer.animate(
    [
      {
        left: `${startX}px`,
        top: `${startY}px`,
        clipPath:
          "polygon(0 12%,12% 0,38% 0,62% 0,88% 0,100% 12%,100% 38%,100% 62%,100% 88%,88% 100%,62% 100%,38% 100%,12% 100%,0 88%,0 62%,0 38%)",
        transform: "translate(-50%, -50%) scale(.72) rotate(-4deg)",
        opacity: 0,
        offset: 0,
      },
      {
        left: `${startX}px`,
        top: `${startY}px`,
        clipPath:
          "polygon(50% 0,66% 8%,85% 15%,92% 34%,100% 50%,92% 66%,85% 85%,66% 92%,50% 100%,34% 92%,15% 85%,8% 66%,0 50%,8% 34%,15% 15%,34% 8%)",
        transform: "translate(-50%, -50%) scale(1.08) rotate(2deg)",
        opacity: 1,
        offset: 0.2,
      },
      {
        left: `${startX + (midpointX - startX) * 0.72}px`,
        top: `${startY + (midpointY - startY) * 0.72}px`,
        clipPath:
          "polygon(50% 0,67% 16%,80% 29%,91% 43%,98% 57%,100% 68%,95% 80%,88% 91%,76% 98%,50% 100%,24% 98%,12% 91%,5% 80%,0 68%,2% 57%,9% 43%)",
        transform: "translate(-50%, -50%) scale(.86) rotate(-4deg)",
        opacity: 1,
        offset: 0.68,
      },
      {
        left: `${midpointX}px`,
        top: `${midpointY}px`,
        clipPath:
          "polygon(50% 0,67% 16%,80% 29%,91% 43%,98% 57%,100% 68%,95% 80%,88% 91%,76% 98%,50% 100%,24% 98%,12% 91%,5% 80%,0 68%,2% 57%,9% 43%)",
        transform: "translate(-50%, -50%) scale(.58) rotate(3deg)",
        opacity: 0.94,
        offset: 0.84,
      },
      {
        left: `${endX}px`,
        top: `${endY}px`,
        clipPath:
          "polygon(50% 0,67% 16%,80% 29%,91% 43%,98% 57%,100% 68%,95% 80%,88% 91%,76% 98%,50% 100%,24% 98%,12% 91%,5% 80%,0 68%,2% 57%,9% 43%)",
        transform: "translate(-50%, -50%) scale(.12) rotate(0deg)",
        opacity: 0,
        offset: 1,
      },
    ],
    {
      duration: 850,
      easing: CART_EASING,
      fill: "forwards",
    }
  );

  animation.onfinish = () => {
    flyer.remove();
    const cartIcon = cartTarget?.querySelector("img");
    cartIcon?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.3)" },
        { transform: "scale(1)" },
      ],
      { duration: 460, easing: CART_EASING }
    );
  };
}

export default function CartButton({ product, className = "" }) {
  const { addItem } = useCart();
  const buttonRef = useRef(null);
  const isAnimating = useRef(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    addItem(product);
    setIsAdded(true);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reducedMotion && buttonRef.current) {
      animateProductToCart(buttonRef.current, product);
    }

    window.setTimeout(() => {
      isAnimating.current = false;
      setIsAdded(false);
    }, 1100);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`relative inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-300 ease-out active:scale-[0.98] ${
        isAdded
          ? "border-[#cbd8d1] bg-[#eaf0ed] text-[#16354a] shadow-sm"
          : "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
      } ${className}`}
      onClick={handleClick}
      aria-live="polite"
    >
      {isAdded ? (
        <>
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="m4.5 10.5 3.5 3.5 7.5-8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Lagt i handlekurv
        </>
      ) : (
        "Legg i handlekurv"
      )}
    </button>
  );
}
