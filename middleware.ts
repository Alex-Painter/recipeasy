import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // TODO?
    console.log(req);
    NextResponse.redirect(new URL("/", req.url));
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        // https://github.com/shadcn-ui/taxonomy/blob/main/middleware.ts#L33-L41
        return true;
      },
    },
  }
);
