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
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 
        bg-white/90 backdrop-blur-md 
        shadow-lg border 
        p-2 rounded-full 
        hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5" />
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
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 
        bg-white/90 backdrop-blur-md 
        shadow-lg border 
        p-2 rounded-full 
        hover:scale-110"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

    </div>
  );
}