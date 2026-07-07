import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { env } from "@/envvars";

export const auth = betterAuth({
  allowedHosts:
    env.BETTER_AUTH_TRUST_HOST === "true"
      ? "*"
      : ["delta.dsek.se", "delta-staging.dsek.se"],
  protocol: env.NODE_ENV === "development" ? "http" : "https",
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
      strategy: "jwe", // can be "jwt" or "compact"
      refreshCache: true, // Enable stateless refresh
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "authentik",
          clientId: env.BETTER_AUTH_AUTHENTIK_ID!,
          clientSecret: env.BETTER_AUTH_AUTHENTIK_SECRET!,
          discoveryUrl: env.BETTER_AUTH_AUTHENTIK_DISCOVERY_ENDPOINT,
          issuer: env.BETTER_AUTH_AUTHENTIK_ISSUER!,
          authorizationUrl: env.BETTER_AUTH_AUTHENTIK_AUTHORIZE_ENDPOINT,
          tokenUrl: env.BETTER_AUTH_AUTHENTIK_TOKEN_ENDPOINT,
          scopes: ["openid", "profile", "email"],
        },
      ],
    }),
  ],
});
