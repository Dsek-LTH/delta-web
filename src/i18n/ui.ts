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
        | Record<string, Record<string, string> | string>
        | undefined;
      if (!content || typeof content !== "object") {
        console.warn(`Skipping ${path}: not an object`);
        continue;
      }
      const { prefix, ...contentWithoutPrefix } = content;
      if (prefix && typeof prefix === "string") {
        for (const [lang, strings] of Object.entries(contentWithoutPrefix)) {
          if (!translations[lang]) translations[lang] = {};
          const newTranslations = Object.entries(strings).reduce(
            (acc, [key, value]) => {
              if (typeof value === "string") {
                acc[`${prefix}.${key}`] = value;
              } else {
                console.warn(
                  `Skipping ${path}: invalid translation for key ${key} in language ${lang}`,
                );
              }
              return acc;
            },
            {} as Record<string, string>,
          );
          translations[lang] = {
            ...translations[lang],
            ...newTranslations,
          };
        }
      } else {
        console.warn(`Skipping ${path}: missing or invalid prefix`);
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
