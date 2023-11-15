import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import AppBar from "../components/AppBar";
import { getCurrentUser } from "../lib/session";
import AppFooter from "../components/AppFooter";
import { Analytics } from "@vercel/analytics/react";

const inter = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omlete",
  description: "Recipes, made easy",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <div className="flex flex-col min-h-screen h-full">
          <AppBar user={user} />
          <div className="flex flex-col flex-grow">{children}</div>
          {/* <AppFooter /> */}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
