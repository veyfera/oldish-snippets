import type { Metadata } from "next";
import "../styles/main.scss";

import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Card game engine v0.0.1",
  description: "Game engine for card games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="game-site">
        <Header />
        <main>
            {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
