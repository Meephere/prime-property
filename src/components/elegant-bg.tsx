"use client";

interface ElegantBackgroundProps {
  mode?: "light" | "dark";
}

export default function ElegantBackground({ mode = "light" }: ElegantBackgroundProps) {
  const isDark = mode === "dark";
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Subtle luxury architectural grid (dots + thin grid lines) */}
      <div className={`absolute inset-0 ${isDark ? "bg-lux-grid-dark" : "bg-lux-grid"} ${isDark ? "opacity-50" : "opacity-75"}`}></div>

      {/* Floating blurred organic gradient shapes (very low opacity, premium look) */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#C9A961]/4 blur-[130px] animate-float-slow"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#C9A961]/3 blur-[120px] animate-float-slow-reverse"></div>
      <div className={`absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full ${isDark ? "bg-zinc-800/10" : "bg-zinc-200/20"} blur-[100px] animate-float-slow`}></div>

      {/* Subtle luxury geometric/architectural lines */}
      <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${isDark ? "via-zinc-800/40" : "via-zinc-200/50"} to-transparent`}></div>
      <div className={`absolute left-10 inset-y-0 w-[1px] bg-gradient-to-b from-transparent ${isDark ? "via-zinc-900/40" : "via-zinc-100/40"} to-transparent hidden xl:block`}></div>
      <div className={`absolute right-10 inset-y-0 w-[1px] bg-gradient-to-b from-transparent ${isDark ? "via-zinc-900/40" : "via-zinc-100/40"} to-transparent hidden xl:block`}></div>
    </div>
  );
}
