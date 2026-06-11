"use client";

import { motion } from "framer-motion";

// A real 3D CSS die: six pip faces on a cube. Rolls tumble the whole cube
// with full rotations and a gravity bounce, landing EXACTLY on the rolled
// face — no fake spinning sprites.

const SIZE = 68; // px
const HALF = SIZE / 2;

// Pip layout per value on a 3×3 grid (cell indexes 0-8).
const PIP_CELLS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// Standard die: opposite faces sum to 7. Cube face placement:
// front=1 back=6 right=3 left=4 top=2 bottom=5.
const FACES: { value: number; transform: string }[] = [
  { value: 1, transform: `rotateY(0deg) translateZ(${HALF}px)` },
  { value: 6, transform: `rotateY(180deg) translateZ(${HALF}px)` },
  { value: 3, transform: `rotateY(90deg) translateZ(${HALF}px)` },
  { value: 4, transform: `rotateY(-90deg) translateZ(${HALF}px)` },
  { value: 2, transform: `rotateX(90deg) translateZ(${HALF}px)` },
  { value: 5, transform: `rotateX(-90deg) translateZ(${HALF}px)` },
];

/** Cube rotation that brings each face value to the front. */
const FACE_ROT: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

export const DIE_ROLL_MS = 1150;

function Face({ value, transform, glow }: { value: number; transform: string; glow: boolean }) {
  return (
    <div
      className={`absolute grid grid-cols-3 grid-rows-3 gap-0.5 rounded-xl border p-2.5 ${
        glow ? "border-win/70" : "border-slate-300"
      }`}
      style={{
        width: SIZE,
        height: SIZE,
        transform,
        background: "linear-gradient(145deg, #ffffff 0%, #e8edf2 70%, #cfd9e2 100%)",
        boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.18), inset 0 2px 4px rgba(255,255,255,0.9)",
        backfaceVisibility: "hidden",
      }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="grid place-items-center">
          {PIP_CELLS[value]?.includes(i) && (
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 30%, #3a4654, #0b1118 70%)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

export function Die3D({
  value,
  rollKey,
  delay = 0,
  glow = false,
}: {
  value: number;
  /** Bump to replay the tumble animation (e.g. one per roll). */
  rollKey: number;
  delay?: number;
  glow?: boolean;
}) {
  const target = FACE_ROT[value];
  // Land on the exact face after two and a half chaotic tumbles.
  const spins = 2;

  return (
    <div className="perspective-800" style={{ width: SIZE, height: SIZE }}>
      {/* gravity: bounce in from above while the cube tumbles */}
      <motion.div
        key={`bounce-${rollKey}`}
        initial={rollKey > 0 ? { y: -150, opacity: 0.6 } : false}
        animate={{ y: [null, 0, -42, 0, -14, 0], opacity: 1 }}
        transition={{
          duration: DIE_ROLL_MS / 1000,
          times: [0, 0.42, 0.62, 0.78, 0.9, 1],
          ease: "easeOut",
          delay,
        }}
        className="preserve-3d h-full w-full"
        style={{ filter: glow ? "drop-shadow(0 0 16px rgba(0,230,92,0.8))" : "drop-shadow(0 14px 10px rgba(0,0,0,0.45))" }}
      >
        {/* constant viewing tilt so the cube reads as 3D even at rest */}
        <div
          className="preserve-3d h-full w-full"
          style={{ transform: "rotateX(-22deg) rotateY(18deg)" }}
        >
          <motion.div
            key={`spin-${rollKey}`}
            className="preserve-3d relative h-full w-full"
            initial={
              rollKey > 0
                ? { rotateX: target.x - spins * 360 - 120, rotateY: target.y - spins * 360 - 60 }
                : { rotateX: target.x, rotateY: target.y }
            }
            animate={{ rotateX: target.x, rotateY: target.y }}
            transition={{ duration: DIE_ROLL_MS / 1000, ease: [0.16, 0.9, 0.3, 1], delay }}
          >
            {FACES.map((f) => (
              <Face key={f.value} value={f.value} transform={f.transform} glow={glow} />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/** Empty slot for a die that hasn't been rolled yet this turn. */
export function DieSlot() {
  return (
    <div
      className="grid place-items-center rounded-xl border-2 border-dashed border-white/25 text-2xl font-extrabold text-white/30"
      style={{ width: SIZE, height: SIZE }}
    >
      ?
    </div>
  );
}
