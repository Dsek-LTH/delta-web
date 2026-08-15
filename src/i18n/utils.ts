import { ui, defaultLang } from "./ui";
import { type AstroCookies } from "astro";

export function getLang(cookies?: AstroCookies): keyof typeof ui {
  const lang = cookies?.get("lang")?.value;
  if (lang && lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function i18n(cookies?: AstroCookies): {
  lang: keyof typeof ui;
  translate: ReturnType<typeof useTranslations>;
} {
  const lang = getLang(cookies);
  const translate = useTranslations(lang);
  return { lang, translate };
}

export function getLocalizedPath(pathname: string, newLang: string): string {
  const segments = pathname.split("/");
  segments[1] = newLang;
  return segments.join("/");
}
