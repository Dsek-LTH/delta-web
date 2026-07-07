import { createAuthClient } from "better-auth/client";
import { genericOAuthClient } from "better-auth/client/plugins";
import { env } from "@/envvars";

export const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL!,
  plugins: [genericOAuthClient()],
});
