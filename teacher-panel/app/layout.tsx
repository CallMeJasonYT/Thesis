import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactElement, ReactNode } from "react";
import { type NextFont } from "next/dist/compiled/@next/font";
import localFont from "next/font/local";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { cn } from "./utils/classnameMerge";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { NotificationProvider } from "./contexts/NotificationContext";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Manage your players and activities with ease.",
  openGraph: {
    images: [{ url: "/images/admin.png", width: 128, height: 128 }],
  },
};
export const viewport: Viewport = { themeColor: "#18181B" };

const satoshi: NextFont = localFont({
  src: "../font/Satoshi.ttf",
});

const RootLayout = ({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement => (
  <html
    lang="en"
    className={cn(`${satoshi.className} scroll-smooth antialiased select-none`)}
  >
    <body
      style={{
        background:
          "linear-gradient(to top, hsl(240, 6%, 10%), var(--background))",
      }}
    >
      <div className="min-h-screen px-7 pb-5 max-w-xl mx-auto flex flex-col gap-5">
        <WebSocketProvider>
          <NotificationProvider>
            <Navbar />
            {children}
            <Footer />
          </NotificationProvider>
        </WebSocketProvider>
      </div>
    </body>
  </html>
);
export default RootLayout;
