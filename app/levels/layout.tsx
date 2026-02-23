export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center">
      <div className="inline-block w-full justify-center">
        {children}
      </div>
    </section>
  );
}
