import { auth } from "@/auth";
import { getActionContext } from "astro:actions";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const { action } = getActionContext(context);
  if (
    pathname.startsWith("/api/auth") ||
    (pathname.match(/\.\w+$/) && !action)
  ) {
    return next();
  }

  const isAuthed = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (pathname.startsWith("/admin/") && !isAuthed) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (action && !action.name.startsWith("language") && !isAuthed) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (isAuthed) {
    context.locals.user = isAuthed.user;
    context.locals.session = isAuthed.session;
  } else {
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
