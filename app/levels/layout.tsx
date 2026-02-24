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
