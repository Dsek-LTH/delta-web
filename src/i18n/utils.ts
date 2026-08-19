import { ui, defaultLang } from "./ui";
import { type AstroGlobal } from "astro";

function resolveLang(candidate: string): keyof typeof ui | null {
  const normalized = candidate.trim().toLowerCase();
  if (normalized in ui) return normalized as keyof typeof ui;

  const baseLang = normalized.split("-")[0] as keyof typeof ui;
  if (baseLang in ui) return baseLang;

  return null;
}

export function getLang(astro: Readonly<AstroGlobal>): keyof typeof ui {
  const { cookies, request } = astro;
  const lang = cookies?.get("lang")?.value;
  if (lang && lang in ui) return lang as keyof typeof ui;

  const preferredLangs =
    request.headers
      .get("accept-language")
      ?.split(",")
      .map((entry) => entry.trim().split(";")[0])
      .filter(Boolean) ?? [];

  for (const candidate of preferredLangs) {
    const resolved = resolveLang(candidate);
    if (resolved) return resolved;
  }

  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function i18n(astro: Readonly<AstroGlobal>): {
  lang: keyof typeof ui;
  translate: ReturnType<typeof useTranslations>;
} {
  const lang = getLang(astro);
  const translate = useTranslations(lang);
  return { lang, translate };
}
