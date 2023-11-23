import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import AppBar from "../components/AppBar/AppBar";
import { getCurrentUser } from "../lib/session";
import AppFooter from "../components/AppFooter";
import { Analytics } from "@vercel/analytics/react";
import NewUserClient from "../components/NewUserDialog/NewUserClient";
import CookieConsentBanner from "../components/CookieConsent";
import NavigationEvents from "../components/NavigationEvents";

const inter = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://eatomlete.com"),
  title: "Omlete",
  description: "Recipes, made easy",
  openGraph: {
    type: "website",
    url: "https://eatomlete.com",
    title: "Leftover ingredients, unlimited recipes | Omlete",
    description:
      "Transform your leftover ingredients into exciting new dishes. Discover innovative, easy-to-follow recipes tailored to what's in your fridge.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  console.log("layout");
  console.log(user);
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <div className="flex flex-col h-full">
          <AppBar user={user} />
          <div className="grow">{children}</div>
          {/* <AppFooter /> */}
          <CookieConsentBanner />
          <Analytics />
          <NewUserClient user={user} />
        </div>
      </body>
    </html>
  );
}
