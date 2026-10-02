export const PRODUCT_TYPES = [
  "Nicho (Alta Perfumaria)",
  "Perfumes Árabes",
  "Perfume Design",
  "Decants de Nicho",
  "Decants Design",
  "Decants Árabes",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const LEGACY_PRODUCT_TYPES = ["Perfume", "Decante"] as const;
export type LegacyProductType = (typeof LEGACY_PRODUCT_TYPES)[number];

export const ALL_PRODUCT_TYPES = [
  ...PRODUCT_TYPES,
  ...LEGACY_PRODUCT_TYPES,
] as const;
