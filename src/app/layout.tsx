import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/contex/Providers";
import { Toaster } from "sonner";
import { ThemeWrapper } from "@/components/ui/ThemeWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Woorden boek",
  description: " Turks, nederlands vertaal spel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <ThemeWrapper>
            <div className="bg-gray-50 dark:bg-gray-800">
              <Navbar></Navbar>
              <main className="min-h-[calc(100vh-74px)] flex justify-center items-center">
                {children}
              </main>
              <Toaster />
            </div>
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}
