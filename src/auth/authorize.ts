import type { APIContext } from "astro";

export function authorize(context: APIContext): void {
  if (!context.locals.session) throw Error("Unauthorized");
}
