export function FloatingDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-10 top-28 h-28 w-44 rounded-full bg-white/75 blur-sm cloud" />
      <div className="absolute right-12 top-40 h-20 w-36 rounded-full bg-white/75 blur-sm cloud" />
      <div className="absolute bottom-20 left-1/4 h-24 w-48 rounded-full bg-white/60 blur-sm cloud" />
      <div className="absolute right-1/4 top-24 rotate-12 text-5xl">✈️</div>
      <div className="absolute left-1/3 top-36 h-1 w-64 rotate-12 border-t-4 border-dashed border-nicolePink/30" />
    </div>
  );
}
