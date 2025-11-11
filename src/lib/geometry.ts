export function angleABC(A: any, B: any, C: any): number | null {
  if (!A || !B || !C) return null;

  const ab = { x: A.x - B.x, y: A.y - B.y };
  const cb = { x: C.x - B.x, y: C.y - B.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);

  if (!magAB || !magCB) return null;

  const cos = dot / (magAB * magCB);
  const clamped = Math.min(1, Math.max(-1, cos));
  return (Math.acos(clamped) * 180) / Math.PI;
}

export function avg(a: number | null, b: number | null): number | null {
  const vals = [a, b].filter((v) => v != null) as number[];
  if (!vals.length) return null;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}
