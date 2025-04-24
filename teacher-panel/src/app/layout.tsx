import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactElement, type ReactNode } from "react";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import BackgroundPattern from "@/components/bg-pattern";
import VignetteBackground from "@/components/vignette-bg";
import { cn } from "@/utils/classnameMerge";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SharedDataProvider } from "@/contexts/SharedDataContext";
import { TooltipProvider } from "@/components/ui/tooltip";

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
}: Readonly<{
  children: ReactNode;
}>) => (
  <html lang="en" suppressHydrationWarning>
    <body
      className={cn(
        "antialiased scroll-smooth select-none",
        montserrat.className
      )}
    >
      {/* Background Elements */}
      <VignetteBackground />
      <BackgroundPattern />

      <div className="flex flex-col min-h-screen relative z-10">
        <WebSocketProvider>
          <NotificationProvider>
            <SharedDataProvider>
              <TooltipProvider>
                <Navbar />
                <main className="flex-grow">
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center">
                        Loading...
                      </div>
                    }
                  >
                    <div className="mx-auto max-w-screen-3xl relative px-4">
                      {children}
                    </div>
                  </Suspense>
                </main>
                <Footer />
              </TooltipProvider>
            </SharedDataProvider>
          </NotificationProvider>
        </WebSocketProvider>
      </div>
    </body>
  </html>
);
export default RootLayout;
