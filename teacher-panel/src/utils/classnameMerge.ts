import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
/**
 * Merge class names.
 *
 * @param inputs the class names to merge
 * @returns the merged class names
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
