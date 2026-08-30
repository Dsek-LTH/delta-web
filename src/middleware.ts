import { auth } from "@/auth";
import { getActionContext } from "astro:actions";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;
  if (pathname.startsWith("/api/auth") || pathname.match(/\.\w+$/)) {
    return next();
  }

  const isAuthed = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (pathname.startsWith("/admin/") && !isAuthed) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { action } = getActionContext(context);
  if (action?.name.startsWith("deltaForceMember") && !isAuthed) {
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
