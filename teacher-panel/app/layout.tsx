import "./globals.css";

export const metadata = {
  title: "Admin Panel",
  description: "Manage your players and activities with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <html lang="en">{children}</html>;
}
