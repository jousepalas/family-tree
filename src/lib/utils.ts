// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display (e.g., "January 1, 2023")
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  try {
    return format(new Date(date), 'PPP'); // PPP is a locale-aware format like "Jan 1st, 2023"
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return 'Invalid Date';
  }
}

// Format date for input[type="date"] (YYYY-MM-DD)
export function formatDateForInput(date: Date | string | number | null | undefined): string {
    if (!date) return '';
    try {
        return format(new Date(date), 'yyyy-MM-dd');
    } catch (error) {
        console.error("Error formatting date for input:", date, error);
        return '';
    }
}