import './globals.css';

export const metadata = {
  title: "Admin Panel",
  description: "Manage your players and activities with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-blue-500 text-white p-4 shadow-md">
          <h1 className="text-center text-2xl font-bold">Admin Panel</h1>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="bg-gray-800 text-white text-center p-2">
          &copy; {new Date().getFullYear()} Admin Panel
        </footer>
      </body>
    </html>
  );
}
