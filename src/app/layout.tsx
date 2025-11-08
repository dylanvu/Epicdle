import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { theme } from "@/config/theme";
import { FirebaseAnalyticsProvider } from "@/contexts/firebaseContext";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import Head from "next/head";
import { GAME_URL } from "@/constants";
import { Analytics } from "@vercel/analytics/next";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"], // Specify the desired weights (e.g., normal and bold)
  display: "swap", // Recommended for font loading optimization
});

export const metadata: Metadata = {
  title: "Epicdle",
  description: "Guess the daily Epic: The Musical song!",
  keywords:
    "epic the musical, wordle, heardle, musical, music, song, guessing game",
  openGraph: {
    title: "Epicdle",
    description: "Guess the daily Epic: The Musical song!",
    url: GAME_URL,
    siteName: "Epicdle",
    images: [
      {
        url: `${GAME_URL}/Epic_The_Musical_Album_Cover.webp`,
        width: 630,
        height: 630,
        alt: "Epicdle",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: GAME_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon/favicon.ico",
    // optional: can specify multiple sizes if needed
    shortcut: "/favicon/favicon.ico",
  },
  // Preload images
  metadataBase: new URL("https://epicdle.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
      <Head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <ColorSchemeScript />
      </Head>
      <body className={`${lato.className}`}>
        <MantineProvider theme={theme}>
          <FirebaseAnalyticsProvider>
            <Notifications />
            {children}
            <Analytics />
          </FirebaseAnalyticsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
