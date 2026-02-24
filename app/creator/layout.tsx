import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Info",
};

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <section className="w-full flex flex-col h-[calc(100vh-64px-48px)]">{children}</section>;
}
