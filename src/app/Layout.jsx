import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata = {
  title: "Echoes of Gaia",
  description: "Connecting history, evolution, and Earth.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />

        {/* Main page content */}
        <main className="flex-grow">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
