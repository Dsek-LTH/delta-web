export const languages = {
  sv: "Svenska",
  en: "English",
};

export const defaultLang = "sv";

const getTranslations = async (): Promise<
  Record<keyof typeof languages, Record<string, string>>
> => {
  const translations: Record<string, Record<string, string>> = {};
  const knownPrefixes = new Set<string>();

  const modules = import.meta.glob("/src/i18n/translations/**/*.json");

  for (const path of Object.keys(modules)) {
    let mod;
    try {
      mod = await (modules[path] as () => Promise<any>)();
    } catch (err) {
      console.error(`Failed to load translations from ${path}:`, err);
      continue;
    }

    const content = mod?.default ?? mod;

    if (!content || typeof content !== "object") {
      console.warn(`Skipping ${path}: not an object`);
      continue;
    }

    const { prefix, ...langContent } = content as Record<string, any>;

    if (typeof prefix !== "string" || !prefix) {
      console.warn(`Skipping ${path}: missing or invalid prefix`);
      continue;
    }

    if (knownPrefixes.has(prefix)) {
      console.warn(`Skipping ${path}: duplicate prefix ${prefix}`);
      continue;
    }

    knownPrefixes.add(prefix);

    for (const [lang, strings] of Object.entries(langContent)) {
      if (!strings || typeof strings !== "object") {
        console.warn(`Skipping ${lang} at ${path}: invalid content ${strings}`);
        continue;
      }

      if (!translations[lang]) translations[lang] = {};

      for (const [key, value] of Object.entries(
        strings as Record<string, any>,
      )) {
        if (typeof value === "string") {
          translations[lang][`${prefix}.${key}`] = value;
        } else {
          console.warn(`Skipping ${path}: invalid value for ${lang}.${key}`);
        }
      }
    }
  }

  return translations;
};

export const ui: Record<
  keyof typeof languages,
  Record<string, string>
> = await getTranslations();
