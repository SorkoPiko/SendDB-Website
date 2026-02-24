import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators",
};

export default function CreatorsLayout({
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