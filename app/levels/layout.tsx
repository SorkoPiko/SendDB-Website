import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Levels",
};

export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full flex flex-col">
      {children}
    </section>
  );
}
