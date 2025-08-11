"use client";
import { useState } from "react";
import Image from "next/image";

export default function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goToIndex = (index) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setTransitioning(false);
    }, 300);
  };

  const goToPrevious = () => {
    goToIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    goToIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center bg-white select-none">
      {/* Left Thumbnails */}
      <div className="absolute top-0 left-0 flex flex-col gap-4 p-3 bg-transparent z-20">
        {images.map((src, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            aria-label={`Preview image ${index + 1}`}
            className={`relative rounded-lg overflow-hidden border-2 transition-transform duration-300 ease-in-out cursor-pointer border-gray-400 ${
              index === currentIndex
                ? "scale-110 shadow-lg border-black"
                : "hover:border-gray-600 hover:scale-105 hover:shadow-md"
            }`}
            style={{ width: "60px", height: "75px" }}
          >
            <Image
              src={src}
              alt={`Preview ${index + 1}`}
              fill
              className="object-cover"
              sizes="60px"
              priority={index === currentIndex}
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Main Image with left padding friction */}
      <div className="relative w-full h-full pl-[90px] overflow-hidden rounded-lg shadow-md">
        <Image
          key={images[currentIndex]}
          src={images[currentIndex]}
          alt={`Product image ${currentIndex + 1}`}
          fill
          priority
          className={`object-cover transition-opacity duration-300 ease-in-out ${
            transitioning ? "opacity-0" : "opacity-100"
          }`}
          sizes="(max-width: 768px) 100vw, 50vw"
          draggable={false}
        />

        {/* Navigation rectangle with arrows inside - moved to bottom right, shifted 80px more left */}
        <div
          className="absolute bg-white rounded-full shadow-md flex items-center justify-between px-2"
          style={{
            bottom: "12px",     // bottom aligned with some gap
            right: "8px",      // moved 80px left from previous -12px to 68px
            width: "90px",
            height: "40px",
            zIndex: 30,
            cursor: "pointer",
          }}
        >
          {/* Left arrow */}
          <button
            onClick={goToPrevious}
            aria-label="Previous image"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="black"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={goToNext}
            aria-label="Next image"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="black"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
