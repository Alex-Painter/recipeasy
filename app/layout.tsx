import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppBar from "../components/AppBar";
import { getCurrentUser } from "../lib/session";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <AppBar user={user} />
        {children}
      </body>
    </html>
  );
}