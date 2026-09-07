import { auth } from "@/auth";

export async function authorize(headers?: Headers) {
  if (
    !headers ||
    !(await auth.api.getSession({
      headers,
    }))
  ) {
    throw Error("Unauthorized");
  }
}
