export const languages = {
  sv: "Svenska",
  en: "English",
};

export const defaultLang = "sv";

async function getTranslations(): Promise<
  Record<string, Record<string, string>>
> {
  const translations: Record<string, Record<string, string>> = {};

  const modules = import.meta.glob("/src/i18n/translations/**/*.json"); // lazy import so we can catch parse errors
  const paths = Object.keys(modules);

  for (const path of paths) {
    const importer = modules[path] as () => Promise<any>;
    try {
      const mod = await importer();
      const content = (mod && (mod.default ?? mod)) as
        | Record<string, Record<string, string>>
        | undefined;
      if (!content || typeof content !== "object") {
        console.warn(`Skipping ${path}: not an object`);
        continue;
      }
      for (const [lang, strings] of Object.entries(content)) {
        if (!translations[lang]) translations[lang] = {};
        translations[lang] = {
          ...translations[lang],
          ...(strings as Record<string, string>),
        };
      }
    } catch (err) {
      console.error(`Failed to load translations from ${path}:`, err);
    }
  }

  return translations;
}

const translations: Record<
  string,
  Record<string, string>
> = await getTranslations();
export const ui = translations;
