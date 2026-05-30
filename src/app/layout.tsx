import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Sometype_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sometypeMono = Sometype_Mono({
  variable: "--font-sometype-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "서천군 정책관리 ERP",
  description: "서천군청 정책·주요업무·순기표 통합 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${sometypeMono.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
