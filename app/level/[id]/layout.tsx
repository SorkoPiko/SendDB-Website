import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Level Info",
};

export default function LevelLayout({ children }: { children: React.ReactNode }) {
  return <section className="w-full flex flex-col h-[calc(100vh-64px-48px)]">{children}</section>;
}