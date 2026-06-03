"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategorySlider({ children, id, locale }: any) {

  const scrollRef = useRef<HTMLDivElement>(null);

  const isRTL = locale === "ar";

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // ❌ disable on mobile
    if (window.innerWidth < 768) return;

    let interval: any;

    const startAutoScroll = () => {
      interval = setInterval(() => {

        container.scrollBy({
          left: isRTL ? -300 : 300,
          behavior: "smooth"
        });

        if (isRTL) {
          if (container.scrollLeft <= 0) {
            container.scrollTo({
              left: container.scrollWidth - container.clientWidth,
              behavior: "smooth"
            });
          }
        } else {
          if (
            container.scrollLeft + container.clientWidth >=
            container.scrollWidth - 10
          ) {
            container.scrollTo({
              left: 0,
              behavior: "smooth"
            });
          }
        }

      }, 4000);
    };

    startAutoScroll();

    const stop = () => clearInterval(interval);

    container.addEventListener("mouseenter", stop);
    container.addEventListener("mouseleave", startAutoScroll);

    return () => {
      clearInterval(interval);
      container.removeEventListener("mouseenter", stop);
      container.removeEventListener("mouseleave", startAutoScroll);
    };

  }, [isRTL]);

  return (
   <div className="relative">

      {/* LEFT BUTTON */}
      <button
        onClick={() => {
          scrollRef.current?.scrollBy({
            left: isRTL ? 350 : -350,
            behavior: "smooth",
          });
        }}
className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-50
w-10 h-10 items-center justify-center
bg-white/95 backdrop-blur
border border-gray-200 shadow-md
rounded-full
text-gray-700
hover:bg-blue-600 hover:text-white hover:border-blue-600
hover:scale-105
transition-all duration-200"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* SLIDER */}
      <div
        ref={scrollRef}
        id={id}
        dir={isRTL ? "rtl" : "ltr"} // 🔥 FIX RTL
        className="flex items-stretch gap-4 overflow-x-auto overflow-y-visible scroll-smooth no-scrollbar px-4 py-6"
      >
        {children}
      </div>

      {/* RIGHT BUTTON */}
      <button
        onClick={() => {
          scrollRef.current?.scrollBy({
            left: isRTL ? -350 : 350,
            behavior: "smooth",
          });
        }}
className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-50
w-10 h-10 items-center justify-center
bg-white/95 backdrop-blur
border border-gray-200 shadow-md
rounded-full
text-gray-700
hover:bg-blue-600 hover:text-white hover:border-blue-600
hover:scale-105
transition-all duration-200"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

    </div>
  );
}