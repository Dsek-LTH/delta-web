import type { APIContext } from "astro";

export type AuthContext = Pick<APIContext, "locals">;

export function authorize(context: AuthContext): void {
  if (!context.locals.session) throw Error("Unauthorized");
}
