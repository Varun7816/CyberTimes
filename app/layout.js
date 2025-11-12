import "./globals.css";
import Header from "../components/Header";
import ComingSoonProvider from "../components/ComingSoonProvider";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ComingSoonProvider>
          <Header />
          {children}
          <Analytics />
        </ComingSoonProvider>
      </body>
    </html>
  );
}
