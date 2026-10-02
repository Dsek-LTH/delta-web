import { auth } from "@/auth";

export function authorize(headers?: Headers) {
  if (
    !headers ||
    !auth.api.getSession({
      headers,
    })
  ) {
    throw Error("Unauthorized");
  }
}
