import { ca, type UiStrings } from "./ca";

export const defaultLocale = "ca";
export type Locale = typeof defaultLocale;

const dictionaries: Record<Locale, UiStrings> = { ca };

export function t(locale: Locale = defaultLocale): UiStrings {
  return dictionaries[locale];
}
