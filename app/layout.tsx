import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "MEND | Keep the feeling. Repair the plan.",
  description:
    "A cultural event workspace for thoughtful lineups, balanced audiences and practical disruption recovery.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
