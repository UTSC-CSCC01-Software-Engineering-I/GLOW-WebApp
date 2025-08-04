import "./globals.css";

export const metadata = {
  title: "GLOW",
  description: "A project by Microsofties. A CSCC01 Project for a Client.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
