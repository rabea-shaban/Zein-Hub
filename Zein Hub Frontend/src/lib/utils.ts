import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(weeks: number, hours: number): string {
  return `${weeks} أسابيع (${hours} ساعة تدريبية)`;
}
