import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a value as Taka currency.
 *  - Whole numbers: ৳1,234 (no decimals)
 *  - Fractional: ৳1,234.56 (always 2 decimals)
 *
 * Use this everywhere instead of inline toLocaleString templates.
 */
export function formatTaka(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "৳0";
  const isWhole = num % 1 === 0;
  return `৳${num.toLocaleString("en-US", isWhole
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
