"use client";

import { useState, useMemo } from "react";
import ProductActions from "@/components/ProductActions";
import { useTranslations, useLocale } from "next-intl";

export default function ProductVariantsSelector({ product, variants }: any) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const isArabic = locale === "ar";

  // ✅ STATES
  const [selectedDiameter, setSelectedDiameter] = useState<string | null>(null);
  const [selectedHole, setSelectedHole] = useState<string | null>(null);
  const [selectedGrit, setSelectedGrit] = useState<string | null>(null);
  const [selectedThickness, setSelectedThickness] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  // 🔥 helper: remove null / empty / undefined
  const cleanOptions = (field: string) => {
    return [
      ...new Set(
        variants
          .map((v: any) => v[field])
          .filter(
            (value: any) =>
              value !== null &&
              value !== undefined &&
              value !== ""
          )
          .map((value: any) => String(value))
      ),
    ];
  };

  // 🔥 OPTIONS
  const allDiameters = cleanOptions("diameter");
  const allThickness = cleanOptions("thickness");
  const allHoles = cleanOptions("hole_size");
  const allGrits = cleanOptions("grit");
  const allLengths = cleanOptions("length");
  const allMachines = cleanOptions("machine");

  // ✅ CHECK HOW MANY OPTION GROUPS HAVE MORE THAN ONE OPTION
  const activeOptionGroups = [
    allDiameters.length > 1,
    allThickness.length > 1,
    allHoles.length > 1,
    allGrits.length > 1,
    allLengths.length > 1,
    allMachines.length > 1,
  ].filter(Boolean).length;

  const shouldFilterOptions = activeOptionGroups > 1;

  // 🔥 FILTER
  const filteredVariants = useMemo(() => {
    return variants.filter(
      (v: any) =>
        (!selectedDiameter || String(v.diameter) === String(selectedDiameter)) &&
        (!selectedHole || String(v.hole_size) === String(selectedHole)) &&
        (!selectedGrit || String(v.grit) === String(selectedGrit)) &&
        (!selectedThickness || String(v.thickness) === String(selectedThickness)) &&
        (!selectedLength || String(v.length) === String(selectedLength)) &&
        (!selectedMachine || String(v.machine) === String(selectedMachine))
    );
  }, [
    variants,
    selectedDiameter,
    selectedHole,
    selectedGrit,
    selectedThickness,
    selectedLength,
    selectedMachine,
  ]);

  const cleanAvailable = (field: string) => {
    if (!shouldFilterOptions) {
      return new Set(cleanOptions(field));
    }

    return new Set(
      filteredVariants
        .map((v: any) => v[field])
        .filter(
          (value: any) =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )
        .map((value: any) => String(value))
    );
  };

  // 🔥 AVAILABLE
  const availableDiameters = cleanAvailable("diameter");
  const availableThickness = cleanAvailable("thickness");
  const availableHoles = cleanAvailable("hole_size");
  const availableGrits = cleanAvailable("grit");
  const availableLengths = cleanAvailable("length");
  const availableMachines = cleanAvailable("machine");

  // 🔥 SELECTED VARIANT
  const selectedVariant = useMemo(() => {
    return filteredVariants.length === 1 ? filteredVariants[0] : null;
  }, [filteredVariants]);

  // 🔥 DEFAULT VARIANT = lowest price
  const defaultVariant = useMemo(() => {
    if (!variants?.length) return null;

    return [...variants].sort((a: any, b: any) => a.price - b.price)[0];
  }, [variants]);

  // 🔥 FINAL VARIANT
  const finalVariant = selectedVariant || defaultVariant;

  // 🔥 PRICE LOGIC
  const displayPrice = finalVariant?.price ?? product?.individual_price ?? 0;

  // 🔥 VARIANT DESCRIPTION
  const variantDescription = finalVariant
    ? isArabic
      ? finalVariant.description_ar || finalVariant.description_en
      : finalVariant.description_en
    : null;

  // 🔘 OPTION BUTTON
  const OptionButton = ({ value, selected, available, onClick }: any) => (
    <button
      onClick={onClick}
      disabled={!available}
      className={`
        px-4 py-2 rounded-lg border text-sm transition
        ${selected ? "bg-blue-600 text-white border-blue-600" : ""}
        ${!selected && available ? "bg-white hover:bg-gray-100" : ""}
        ${!available ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
      `}
    >
      {value}
    </button>
  );

  return (
    <div className="space-y-6">

      {/* Diameter */}
      {allDiameters.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">
            {t("diameter")}
          </h3>

          <div className="flex flex-wrap gap-2">
            {allDiameters.map((d) => (
              <OptionButton
                key={d}
                value={d}
                selected={selectedDiameter === d}
                available={availableDiameters.has(d)}
                onClick={() =>
                  setSelectedDiameter(
                    String(d) === String(selectedDiameter) ? null : String(d)
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Thickness */}
      {allThickness.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">
            {t("thickness")}
          </h3>

          <div className="flex flex-wrap gap-2">
            {allThickness.map((tVal) => (
              <OptionButton
                key={tVal}
                value={tVal}
                selected={selectedThickness === tVal}
                available={availableThickness.has(tVal)}
                onClick={() =>
                  setSelectedThickness(
                    String(tVal) === String(selectedThickness)
                      ? null
                      : String(tVal)
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Length */}
      {allLengths.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">
            {t("length")}
          </h3>

          <div className="flex flex-wrap gap-2">
            {allLengths.map((l) => (
              <OptionButton
                key={l}
                value={l}
                selected={selectedLength === l}
                available={availableLengths.has(l)}
                onClick={() =>
                  setSelectedLength(
                    String(l) === String(selectedLength) ? null : String(l)
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Hole Size */}
      {allHoles.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">
            {t("hole")}
          </h3>

          <div className="flex flex-wrap gap-2">
            {allHoles.map((h) => (
              <OptionButton
                key={h}
                value={h}
                selected={selectedHole === h}
                available={availableHoles.has(h)}
                onClick={() =>
                  setSelectedHole(
                    String(h) === String(selectedHole) ? null : String(h)
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Grit */}
      {allGrits.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">
            {t("grit")}
          </h3>

          <div className="flex flex-wrap gap-2">
            {allGrits.map((g) => (
              <OptionButton
                key={g}
                value={g}
                selected={selectedGrit === g}
                available={availableGrits.has(g)}
                onClick={() =>
                  setSelectedGrit(
                    String(g) === String(selectedGrit) ? null : String(g)
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Machine */}
      {allMachines.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">
            {t("machine")}
          </h3>

          <div className="flex flex-wrap gap-2">
            {allMachines.map((m) => (
              <OptionButton
                key={m}
                value={m}
                selected={selectedMachine === m}
                available={availableMachines.has(m)}
                onClick={() =>
                  setSelectedMachine(
                    String(m) === String(selectedMachine) ? null : String(m)
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {variantDescription && (
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className={`
            text-[15px] leading-7 text-slate-800
            ${isArabic ? "text-right" : "text-left"}
            whitespace-pre-line
          `}
        >
          {variantDescription}
        </div>
      )}

      {/* 🛒 ACTIONS */}
      <ProductActions
        product={product}
        variant={finalVariant}
        disabled={false}
      />

    </div>
  );
}