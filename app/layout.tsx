import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";

export const metadata: Metadata = {
  title: "Orwa Sole Co. — Premium Footwear",
  description:
    "Discover Orwa Sole Co. — premium footwear and considered apparel, crafted to endure. Shop the collection online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}
