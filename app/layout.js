import "./globals.css";
import Header from "../components/Header";
import ComingSoonProvider from "../components/ComingSoonProvider";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* use SVG as primary favicon and add cache-bust */}
        <link rel="icon" href="/favicon.svg?v=3" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <meta name="theme-color" content="#2563eb" />
      </head>
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
