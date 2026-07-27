const dev = import.meta.env.DEV ?? process.env.NODE_ENV === "development";
export const env = dev ? import.meta.env : process.env;
