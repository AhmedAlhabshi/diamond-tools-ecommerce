"use client"

import { useState, useMemo, useEffect } from "react"
import ProductActions from "@/components/ProductActions"
import { useTranslations, useLocale } from "next-intl"

export default function ProductVariantsSelector({
  product,
  variants,
  unitLabel,
  onVariantImageChange,
}: any) {
  const t = useTranslations("Product")
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [selectedDiameter, setSelectedDiameter] = useState<string | null>(null)
  const [selectedHole, setSelectedHole] = useState<string | null>(null)
  const [selectedGrit, setSelectedGrit] = useState<string | null>(null)
  const [selectedThickness, setSelectedThickness] = useState<string | null>(null)
  const [selectedLength, setSelectedLength] = useState<string | null>(null)
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null)
  const [selectedStand, setSelectedStand] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)

  const cleanOptions = (field: string): string[] => {
    const options = variants
      .map((v: any) => v[field])
      .filter((value: any) => value !== null && value !== undefined && value !== "")
      .map((value: any) => String(value))

    return Array.from(new Set<string>(options))
  }

  const getMaterialKey = (v: any) => {
    return String(v.material_name_en || v.material_name_ar || "")
      .trim()
      .toLowerCase()
  }

  const allMaterials = useMemo(() => {
    const map = new Map<string, any>()

    variants.forEach((v: any) => {
      if (!v.material_icon_url) return

      const key = getMaterialKey(v)

      if (!map.has(key)) {
        map.set(key, {
          key,
          name_en: v.material_name_en || "",
          name_ar: v.material_name_ar || "",
          icon_url: v.material_icon_url || "",
        })
      }
    })

    return Array.from(map.values())
  }, [variants])

  const sortOptions = (options: string[]) => {
    return [...options].sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, ""))
      const numB = parseFloat(b.replace(/[^\d.]/g, ""))

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }

      return a.localeCompare(b)
    })
  }

  const allDiameters = sortOptions(cleanOptions("diameter"))
  const allThickness = sortOptions(cleanOptions("thickness"))
  const allHoles = sortOptions(cleanOptions("hole_size"))
  const allGrits = sortOptions(cleanOptions("grit"))
  const allLengths = sortOptions(cleanOptions("length"))
  const allMachines = sortOptions(cleanOptions("machine"))
  const allStands = sortOptions(cleanOptions("stand"))

  const activeOptionGroups = [
    allDiameters.length > 1,
    allThickness.length > 1,
    allHoles.length > 1,
    allGrits.length > 1,
    allLengths.length > 1,
    allMachines.length > 1,
    allStands.length > 1,
    allMaterials.length > 1,
  ].filter(Boolean).length

  const shouldFilterOptions = activeOptionGroups > 1

const getFilteredVariants = (ignoreField?: string) => {
  return variants.filter(
    (v: any) =>
      (ignoreField === "diameter" || !selectedDiameter || String(v.diameter) === String(selectedDiameter)) &&
      (ignoreField === "hole_size" || !selectedHole || String(v.hole_size) === String(selectedHole)) &&
      (ignoreField === "grit" || !selectedGrit || String(v.grit) === String(selectedGrit)) &&
      (ignoreField === "thickness" || !selectedThickness || String(v.thickness) === String(selectedThickness)) &&
      (ignoreField === "length" || !selectedLength || String(v.length) === String(selectedLength)) &&
      (ignoreField === "machine" || !selectedMachine || String(v.machine) === String(selectedMachine)) &&
      (ignoreField === "stand" || !selectedStand || String(v.stand) === String(selectedStand)) &&
      (ignoreField === "material" || !selectedMaterial || getMaterialKey(v) === selectedMaterial)
  )
}

const filteredVariants = useMemo(() => {
  return getFilteredVariants()
}, [
  variants,
  selectedDiameter,
  selectedHole,
  selectedGrit,
  selectedThickness,
  selectedLength,
  selectedMachine,
  selectedStand,
  selectedMaterial,
])

const cleanAvailable = (field: string): Set<string> => {
  if (!shouldFilterOptions) return new Set(cleanOptions(field))

  return new Set(
    getFilteredVariants(field)
      .map((v: any) => v[field])
      .filter((value: any) => value !== null && value !== undefined && value !== "")
      .map((value: any) => String(value))
  )
}

const availableMaterials = useMemo(() => {
  const set = new Set<string>()

  getFilteredVariants("material").forEach((v: any) => {
    if (!v.material_name_en && !v.material_name_ar && !v.material_icon_url) return
    set.add(getMaterialKey(v))
  })

  return set
}, [
  variants,
  selectedDiameter,
  selectedHole,
  selectedGrit,
  selectedThickness,
  selectedLength,
  selectedMachine,
  selectedStand,
  selectedMaterial,
])

  const availableDiameters = cleanAvailable("diameter")
  const availableThickness = cleanAvailable("thickness")
  const availableHoles = cleanAvailable("hole_size")
  const availableGrits = cleanAvailable("grit")
  const availableLengths = cleanAvailable("length")
  const availableMachines = cleanAvailable("machine")
  const availableStands = cleanAvailable("stand")

  // ✅ Initial display: lowest variant price
  const defaultVariant = useMemo(() => {
    if (!variants?.length) return null

    return [...variants].sort(
      (a: any, b: any) => Number(a.price) - Number(b.price)
    )[0]
  }, [variants])

  // ✅ Display price changes based on partial selections
  const displayVariant = useMemo(() => {
    if (!filteredVariants?.length) return defaultVariant

    return [...filteredVariants].sort(
      (a: any, b: any) => Number(a.price) - Number(b.price)
    )[0]
  }, [filteredVariants, defaultVariant])

  // ✅ Cart only works when all visible option groups are selected
 const allRequiredOptionsSelected =
  (allDiameters.length <= 1 || selectedDiameter) &&
  (allThickness.length <= 1 || selectedThickness) &&
  (allHoles.length <= 1 || selectedHole) &&
  (allGrits.length <= 1 || selectedGrit) &&
  (allLengths.length <= 1 || selectedLength) &&
  (allMachines.length <= 1 || selectedMachine) &&
  (allStands.length <= 1 || selectedStand) &&
  (availableMaterials.size <= 1 || selectedMaterial)

  const cartVariant = allRequiredOptionsSelected ? displayVariant : null

  const variantDescription = displayVariant
    ? isArabic
      ? displayVariant.description_ar || displayVariant.description_en
      : displayVariant.description_en
    : null

    useEffect(() => {
  onVariantImageChange?.(displayVariant?.variant_image || "")
}, [displayVariant, onVariantImageChange])

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
)

  return (
    <div className="space-y-6">
      {allDiameters.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">{t("diameter")}</h3>
          <div className="flex flex-wrap gap-2">
            {allDiameters.map((d) => (
              <OptionButton
                key={d}
                value={d}
                selected={selectedDiameter === d}
                available={availableDiameters.has(String(d))}
onClick={() => setSelectedDiameter(String(d))}
              />
            ))}
          </div>
        </div>
      )}

      {allThickness.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">{t("thickness")}</h3>
          <div className="flex flex-wrap gap-2">
            {allThickness.map((tVal) => (
              <OptionButton
                key={tVal}
                value={tVal}
                selected={selectedThickness === tVal}
                available={availableThickness.has(String(tVal))}
onClick={() => setSelectedThickness(String(tVal))}
              />
            ))}
          </div>
        </div>
      )}

      {allMaterials.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">
            {isArabic ? "المادة" : "Material"}
          </h3>

          <div className="flex flex-wrap gap-4 items-center">
            {allMaterials.map((material: any) => {
              const selected = selectedMaterial === material.key
              const available = availableMaterials.has(material.key)

              return (
                <button
                  key={material.key}
                  onClick={() => setSelectedMaterial(selected ? null : material.key)}
                  disabled={!available}
                  className={`relative flex items-center justify-center ${
                    !available ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                >
                  <img
                    src={material.icon_url}
                    alt="material"
                    className={`w-15 h-15 object-contain transition ${
                      selected ? "scale-110" : "hover:scale-105"
                    }`}
                  />

                  {selected && (
                    <span className="absolute inset-0 rounded-full border-2 border-blue-600" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {allLengths.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">{t("length")}</h3>
          <div className="flex flex-wrap gap-2">
            {allLengths.map((l) => (
              <OptionButton
                key={l}
                value={l}
                selected={selectedLength === l}
                available={availableLengths.has(String(l))}
onClick={() => setSelectedLength(String(l))}
              />
            ))}
          </div>
        </div>
      )}

      {allHoles.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">{t("hole")}</h3>
          <div className="flex flex-wrap gap-2">
            {allHoles.map((h) => (
              <OptionButton
                key={h}
                value={h}
                selected={selectedHole === h}
                available={availableHoles.has(String(h))}
onClick={() => setSelectedHole(String(h))}
              />
            ))}
          </div>
        </div>
      )}

      {allGrits.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">{t("grit")}</h3>
          <div className="flex flex-wrap gap-2">
            {allGrits.map((g) => (
              <OptionButton
                key={g}
                value={g}
                selected={selectedGrit === g}
                available={availableGrits.has(String(g))}
onClick={() => setSelectedGrit(String(g))}
              />
            ))}
          </div>
        </div>
      )}

      {allMachines.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">{t("machine")}</h3>
          <div className="flex flex-wrap gap-2">
            {allMachines.map((m) => (
              <OptionButton
                key={m}
                value={m}
                selected={selectedMachine === m}
                available={availableMachines.has(String(m))}
onClick={() => setSelectedMachine(String(m))}
              />
            ))}
          </div>
        </div>
      )}

      {allStands.length > 1 && (
        <div>
          <h3 className="mb-3 text-lg text-slate-800 tracking-wide">
            {isArabic ? "الحامل" : "Stand"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {allStands.map((s) => (
              <OptionButton
                key={s}
                value={s}
                selected={selectedStand === s}
                available={availableStands.has(String(s))}
                onClick={() =>
                  setSelectedStand(String(s) === String(selectedStand) ? null : String(s))
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

<ProductActions
  product={{
    ...product,
    product_variants: variants,
  }}
  variant={cartVariant}
  displayVariant={displayVariant}
  unitLabel={unitLabel}
/>
    </div>
  )
}