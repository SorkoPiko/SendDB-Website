import { JetBrains_Mono as FontMono, Inter as FontSans, IBM_Plex_Sans as FontGraph } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fontGraph = FontGraph({
  subsets: ["latin"],
  variable: "--font-graph",
});