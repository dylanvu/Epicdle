import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { theme } from "@/theme";
import Head from "next/head";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

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
    // TODO: fix the link
    url: "https://epicdle.com",
    siteName: "Epicdle",
    images: [
      {
        url: "/Epic_The_Musical_Album_Cover.webp",
        width: 630,
        height: 630,
        alt: "Epicdle",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://epicdle.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
        <title>Epicdle</title>
        <link
          rel="preload"
          href="/gif/Boar.gif"
          as="image"
          type="image/gif"
          fetchPriority="high"
        />
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <ColorSchemeScript />
      </Head>
      <body className={`${lato.className}`}>
        <MantineProvider theme={theme}>
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
