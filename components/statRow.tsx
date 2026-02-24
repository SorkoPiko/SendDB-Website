export default function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between px-3 py-0.5 group">
      <span className="text-[15px] uppercase tracking-[0.1em] text-default-400 font-medium transition-colors duration-200 group-hover:text-default-500 select-none">
        {label}
      </span>
      <span className="text-base font-bold tabular-nums text-default-800 transition-colors duration-200 group-hover:text-default-900">
        {value}
      </span>
    </div>
  );
}