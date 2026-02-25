import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // you can add extra checks here later (like forcing /sign-in)
    return;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/ops/:path*"],
};
