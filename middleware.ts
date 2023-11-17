import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
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

export const config = {
  matcher: ["/private"],
};
