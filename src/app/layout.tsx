import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppBar from "./AppBar/AppBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recipeasy",
  description: "Recipes, made easy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppBar />
        {children}
      </body>
    </html>
  );
}
