import SplashScreen from "@/components/mend/splash-screen";
import AppFooter from "@/components/mend/app-footer";
import type { Metadata } from "next";
import "./globals.css";
import "./mend-desk.css";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("mend.intro.v1")==="seen"||window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.mendIntro="skip"}}catch{}`,
          }}
        />
      </head>
      <body>
        <SplashScreen />
        <noscript>
          <style>{`.mend-splash{display:none!important}`}</style>
        </noscript>
        <div id="mend-document" className="mend-document" tabIndex={-1}>
          <div className="mend-page-content">{children}</div>
          <AppFooter />
        </div>
      </body>
    </html>
  );
}
