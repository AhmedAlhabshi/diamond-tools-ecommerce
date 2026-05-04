"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export default function QuantitySelector({ qty, setQty }: any) {
  const t = useTranslations("Product");

  const handleChange = (value: string) => {
    const num = Number(value);

    if (isNaN(num)) return;
    if (num < 1) return;

    setQty(num);
  };

  return (
    <div className="flex items-center gap-3">
      
      {/* Label */}
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        {t("quantity")}
      </span>

      {/* Selector */}
      <div className="flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">

        {/* Minus */}
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="h-9 w-9 flex items-center justify-center hover:bg-slate-100 transition"
        >
          <Minus size={16} />
        </button>

        {/* Input */}
        <input
          type="number"
          value={qty}
          onChange={(e) => handleChange(e.target.value)}
          className="h-6 w-10 text-center outline-none border-x font-semibold"
          min={1}
        />

        {/* Plus */}
        <button
          onClick={() => setQty(qty + 1)}
          className="h-9 w-9 flex items-center justify-center hover:bg-slate-100 transition"
        >
          <Plus size={16} />
        </button>

      </div>

    </div>
  );
}