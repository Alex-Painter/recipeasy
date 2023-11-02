import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import AppBar from "../components/AppBar";
import { getCurrentUser } from "../lib/session";
import AppFooter from "../components/AppFooter";
import { Analytics } from "@vercel/analytics/react";

const inter = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omelette",
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
      <body className={`${inter.className} `}>
        <div className="min-h-screen">
          <AppBar user={user} />
          {children}
          <AppFooter />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
