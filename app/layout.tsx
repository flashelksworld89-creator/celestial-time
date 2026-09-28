import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Celestial Time",
  description: "Vedic life-area and transit tracker"
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
