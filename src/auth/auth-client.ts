import { createAuthClient } from "better-auth/client";
import { genericOAuthClient } from "better-auth/client/plugins";
import { env } from "@/envvars";

export const authClient = createAuthClient({
  baseURL: env.NODE_ENV === "development" ? "http://localhost:8080" : undefined,
  plugins: [genericOAuthClient()],
});
