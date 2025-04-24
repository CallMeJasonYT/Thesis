import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactElement, type ReactNode } from "react";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { cn } from "@/utils/classnameMerge";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SharedDataProvider } from "@/contexts/SharedDataContext";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Manage your players and activities with ease.",
  openGraph: {
    images: [{ url: "/images/admin.png", width: 128, height: 128 }],
  },
};
export const viewport: Viewport = { themeColor: "#64F4E0" };

const montserrat = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const RootLayout = ({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement => (
  <html
    suppressHydrationWarning
    lang="en"
    className={cn(
      `${montserrat.className} scroll-smooth antialiased select-none`
    )}
  >
    <body
      className={cn(
        "antialiased scroll-smooth select-none",
        montserrat.className
      )}
    >
      <div className="min-h-screen px-7 pb-5 max-w-xl mx-auto flex flex-col gap-5">
        <WebSocketProvider>
          <NotificationProvider>
            <SharedDataProvider>
              <Navbar />
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              <Footer />
            </SharedDataProvider>
          </NotificationProvider>
        </WebSocketProvider>
      </div>
    </body>
  </html>
);
export default RootLayout;
