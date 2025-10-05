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
  description: "Guess the Epic: The Musical song!",
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
