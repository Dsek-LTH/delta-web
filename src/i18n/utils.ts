import { ui, defaultLang } from "./ui";
import { type AstroCookies } from "astro";

export function getLang(cookies: AstroCookies | null): keyof typeof ui {
  const lang = cookies?.get("lang")?.value;
  if (lang && lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function i18n(cookies: AstroCookies | null): {
  lang: keyof typeof ui;
  translate: ReturnType<typeof useTranslations>;
} {
  const lang = getLang(cookies);
  const translate = useTranslations(lang);
  return { lang, translate };
}

export async function getRenderedContent(
  // getEntry can not be immediately imported into a .ts file, hence parameter.
  getEntry: typeof import("astro:content").getEntry,
  lang: keyof typeof ui,
  entry: string,
) {
  const content = await getEntry(lang, entry);
  return content?.rendered ?? null;
}
