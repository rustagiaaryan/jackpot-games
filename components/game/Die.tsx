"use client";

// A die face rendered with CSS pips in a 3×3 grid.
// Pip layout per value, by cell index:
//   0 1 2
//   3 4 5
//   6 7 8
const PIP_CELLS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Die({ value, glow = false }: { value: number; glow?: boolean }) {
  return (
    <div
      className={`grid h-16 w-16 grid-cols-3 grid-rows-3 gap-0.5 rounded-2xl border border-slate-300 bg-gradient-to-br from-white to-slate-200 p-2.5 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.15),0_6px_16px_rgba(0,0,0,0.45)] sm:h-20 sm:w-20 ${
        glow ? "ring-2 ring-gold shadow-[0_0_30px_rgba(246,197,68,0.7)]" : ""
      }`}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="grid place-items-center">
          {PIP_CELLS[value]?.includes(i) && (
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900 shadow-inner sm:h-3 sm:w-3" />
          )}
        </span>
      ))}
    </div>
  );
}
