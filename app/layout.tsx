import React from "react";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import  Script  from "next/script";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Scheduler | AI Agentic Scheduler",
  description: "AI Scheduler | AI Agentic Scheduler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" richColors />
        <Script src="https://checkout.razorpay.com/v1/checkout.js"   strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
