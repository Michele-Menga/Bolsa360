import { useEffect, useState } from "react";

/* ───────────── Marca ───────────── */
export const BRAND = {
  yellow: "#FFC107",
  black: "#111111",
  white: "#FFFFFF",
};
const GRAY_DARK = "#777777";
const GRAY_LIGHT = "#ABABAB";
const W = 28; // espessura dos arcos

/* ───────────── Utilitários ───────────── */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const h = (e) => setReduced(e.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);
  return reduced;
}

const pt = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
};
// ângulos crescentes = sentido horário (eixo y para baixo)
const arc = (r, from, to) => {
  const [x1, y1] = pt(r, from);
  const [x2, y2] = pt(r, to);
  const sweep = to > from ? 1 : 0;
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 ${large} ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

const css = `
@keyframes b360-draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
@keyframes b360-pop  { from { transform: scale(0) } to { transform: scale(1) } }
@keyframes b360-run  { from { stroke-dashoffset: 0 } to { stroke-dashoffset: -1 } }
.b360-draw { stroke-dasharray: 1; stroke-dashoffset: 1;
  animation: b360-draw .8s cubic-bezier(.65,0,.35,1) forwards; animation-delay: var(--d, 0s); }
.b360-pop { transform-box: fill-box; transform-origin: center; transform: scale(0);
  animation: b360-pop .45s cubic-bezier(.34,1.56,.64,1) forwards; animation-delay: var(--d, 0s); }
.b360-run { stroke-dasharray: .26 .74;
  animation: b360-run 1.6s linear infinite; animation-delay: var(--d, 0s); }
@media (prefers-reduced-motion: reduce) {
  .b360-draw, .b360-pop, .b360-run { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; transform: none; }
}`;

/* ───────────── Logo 1 · Símbolo orbital 360° ─────────────
   mode: "static" | "draw" (desenha-se uma vez) | "loading" (anéis a orbitar) */
export function OrbitLogo({ size = 240, theme = "light", mode = "static", title = "Bolsa360" }) {
  const reduced = useReducedMotion();
  const m = reduced ? "static" : mode;
  const ink = theme === "dark" ? BRAND.white : BRAND.black;
  const col = { ink, yellow: BRAND.yellow, dark: GRAY_DARK, light: GRAY_LIGHT };

  let n = 0;
  const delay = () => ({ "--d": `${(n++ * 0.16).toFixed(2)}s` });

  const seg = (r, from, to, c) => (
    <path
      key={`${r}-${from}`}
      d={arc(r, from, to)}
      fill="none"
      stroke={col[c]}
      strokeWidth={W}
      pathLength="1"
      className={m === "draw" ? "b360-draw" : undefined}
      style={delay()}
    />
  );
  const dot = (r, deg, c, rad = 37) => {
    const [x, y] = pt(r, deg);
    return (
      <circle
        key={`d${r}-${deg}`}
        cx={x}
        cy={y}
        r={rad}
        fill={col[c]}
        className={m === "draw" ? "b360-pop" : undefined}
        style={delay()}
      />
    );
  };
  const spin = (dur, dir) =>
    m === "loading" && (
      <animateTransform
        attributeName="transform"
        type="rotate"
        values={dir > 0 ? "0 0 0;360 0 0" : "0 0 0;-360 0 0"}
        keyTimes="0;1"
        calcMode="spline"
        keySplines=".65 0 .35 1"
        dur={`${dur}s`}
        repeatCount="indefinite"
      />
    );

  return (
    <svg
      viewBox="-300 -300 600 600"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
    >
      <style>{css}</style>

      {/* anel exterior */}
      <g>
        {spin(7, 1)}
        {seg(280, -87, -39, "light")}
        {seg(280, -39, 20, "dark")}
        {seg(280, 20, 105, "ink")}
        {seg(280, 105, 180, "yellow")}
        {dot(280, -87, "light", W / 2)}
        {dot(280, 180, "yellow")}
      </g>

      {/* anel intermédio */}
      <g>
        {spin(4.5, -1)}
        {seg(200, 180, 372, "yellow")}
        {seg(200, 372, 450, "dark")}
        {dot(200, 180, "yellow", W / 2)}
        {dot(200, 90, "ink")}
      </g>

      {/* anel interior */}
      <g>
        {spin(3, 1)}
        {seg(122, 90, 143, "light")}
        {seg(122, 143, 357, "ink")}
        {dot(122, 90, "light", W / 2)}
        {dot(122, -3, "ink")}
      </g>
    </svg>
  );
}

/* ───────────── Logo 2 · Monograma B (e livro) ─────────────
   mode: "static" | "draw" | "loading" (luz a percorrer o contorno)
         | "morph" (o B transforma-se num livro aberto)
   loop: só em "morph". true = B → livro → B sem parar; false = fica no livro
         (duration = segundos da transição quando loop=false).
   Os paths do B e do livro têm a mesma estrutura (curvas cúbicas), por isso a
   transição é contínua. B desenhado à mão: substituir B_DARK/B_GOLD pelo SVG
   oficial se existir (mantendo 5 e 3 segmentos, ou ajustar os do livro). */
const B_DARK = "M26 68 C26 51.3 26 34.7 26 18 C35.3 18 44.7 18 54 18 C68 18 76 26 76 37 C76 47 68 54 56 54 C50.7 59.3 45.3 64.7 40 70";
const B_GOLD = "M24 92 C35.3 92 46.7 92 58 92 C76 92 88 82 88 68 C88 60 84 55 78 52";
const BOOK_DARK = "M55 84 C55 67.3 55 50.7 55 34 C44 24 28 22 14 30 C14 46.7 14 63.3 14 80 C28 74 42 76 55 84 C55 84 55 84 55 84";
const BOOK_GOLD = "M55 34 C66 24 82 22 96 30 C96 46.7 96 63.3 96 80 C82 74 68 76 55 84";
const BOOK_LINES = "M23 48H45M23 58H45M23 68H37M65 48H87M65 58H87M65 68H79";

/* ───────────── Logo 2.1 · Símbolo do Livro Bolsa360 ───────────── */
export function BookLogo({ size = 240, theme = "dark", title = "Bolsa360 — Livro de Oportunidades" }) {
  const ink = theme === "dark" ? BRAND.white : BRAND.black;
  const common = { fill: "none", strokeWidth: 10, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 110 110" width={size} height={size} role={title ? "img" : "presentation"} aria-label={title || undefined}>
      <path d={BOOK_DARK} {...common} stroke={ink} />
      <path d={BOOK_GOLD} {...common} stroke={BRAND.yellow} />
      <path d={BOOK_LINES} fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

export function BMark({ size = 160, theme = "light", mode = "static", loop = true, duration = 2.4, title = "Bolsa360" }) {
  const reduced = useReducedMotion();
  const m = reduced ? "static" : mode;
  const ink = theme === "dark" ? BRAND.white : BRAND.black;
  const common = { fill: "none", strokeWidth: 12, strokeLinecap: "round", strokeLinejoin: "round", pathLength: "1" };

  // temporização da transição B → livro (→ B)
  const T = loop
    ? { dur: "5s", keyTimes: "0;.15;.4;.75;1", keySplines: "0 0 1 1;.65 0 .35 1;0 0 1 1;.65 0 .35 1", rep: "indefinite" }
    : { dur: `${duration}s`, keyTimes: "0;.2;1", keySplines: "0 0 1 1;.65 0 .35 1", rep: "1" };
  const seq = (a, b) => (loop ? `${a};${a};${b};${b};${a}` : `${a};${a};${b}`);
  const anim = (attr, values) => (
    <animate
      attributeName={attr}
      values={values}
      keyTimes={T.keyTimes}
      calcMode="spline"
      keySplines={T.keySplines}
      dur={T.dur}
      repeatCount={T.rep}
      fill="freeze"
    />
  );

  if (m === "book") {
    return <BookLogo size={size} theme={theme} title={title} />;
  }

  if (m === "morph") {
    return (
      <svg viewBox="0 0 110 110" width={size} height={size} role={title ? "img" : "presentation"} aria-label={title || undefined}>
        <path d={B_DARK} {...common} stroke={ink}>
          {anim("d", seq(B_DARK, BOOK_DARK))}
        </path>
        <path d={B_GOLD} {...common} stroke={BRAND.yellow}>
          {anim("d", seq(B_GOLD, BOOK_GOLD))}
        </path>
        <path d={BOOK_LINES} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" opacity="0">
          {anim("opacity", seq("0", ".55"))}
        </path>
      </svg>
    );
  }

  const layer = (d, color, delay) => {
    if (m === "loading") {
      return (
        <g>
          <path d={d} {...common} stroke={color} opacity=".18" />
          <path d={d} {...common} stroke={color} className="b360-run" style={{ "--d": delay }} />
        </g>
      );
    }
    return (
      <path
        d={d}
        {...common}
        stroke={color}
        className={m === "draw" ? "b360-draw" : undefined}
        style={{ "--d": delay }}
      />
    );
  };

  return (
    <svg
      viewBox="0 0 110 110"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
    >
      <style>{css}</style>
      {layer(B_DARK, ink, "0s")}
      {layer(B_GOLD, BRAND.yellow, m === "loading" ? ".8s" : ".7s")}
    </svg>
  );
}

/* ───────────── Lockup (símbolo + nome + slogan) ───────────── */
export function Bolsa360Lockup({
  symbol = "orbit", // "orbit" | "b"
  orientation = "vertical", // "vertical" | "horizontal"
  theme = "light",
  mode = "static",
  size = 200,
  tagline = true,
}) {
  const ink = theme === "dark" ? BRAND.white : BRAND.black;
  const vertical = orientation === "vertical";
  const fs = vertical ? size * 0.2 : size * 0.38;
  const Symbol = symbol === "orbit" ? OrbitLogo : BMark;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: "center",
        gap: vertical ? size * 0.06 : size * 0.12,
        fontFamily: "Poppins, system-ui, sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');`}</style>
      <Symbol size={size} theme={theme} mode={mode} title="" />
      <div style={{ textAlign: vertical ? "center" : "left" }}>
        <div style={{ fontWeight: 700, fontSize: fs, letterSpacing: ".04em", lineHeight: 1, color: ink }}>
          BOLSA<span style={{ color: BRAND.yellow }}>360</span>
        </div>
        {tagline && (
          <div
            style={{
              marginTop: fs * 0.35,
              fontWeight: 300,
              fontSize: fs * 0.26,
              letterSpacing: ".2em",
              color: ink,
            }}
          >
            O TEU FUTURO. 360° DE OPORTUNIDADES.
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── Loader pronto a usar ───────────── */
export function Bolsa360Loader({ label = "A processar…", theme = "light", size = 120, symbol = "orbit" }) {
  const ink = theme === "dark" ? BRAND.white : BRAND.black;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ display: "grid", justifyItems: "center", gap: 16, fontFamily: "Poppins, system-ui, sans-serif" }}
    >
      {symbol === "b" ? (
        <BMark size={size} theme={theme} mode="morph" title="" />
      ) : (
        <OrbitLogo size={size} theme={theme} mode="loading" title="" />
      )}
      <span style={{ color: ink, fontWeight: 500, fontSize: 15 }}>{label}</span>
    </div>
  );
}

/* ───────────── Demonstração ───────────── */
const MODES = [
  { id: "loading", label: "Processar" },
  { id: "morph", label: "B → livro" },
  { id: "draw", label: "Desenhar" },
  { id: "static", label: "Parado" },
];

export default function Bolsa360Logos() {
  const [mode, setMode] = useState("loading");
  const [run, setRun] = useState(0);

  const pick = (id) => {
    setMode(id);
    setRun((r) => r + 1); // reinicia a animação "desenhar"
  };

  const panel = (theme) => {
    const dark = theme === "dark";
    return (
      <section
        key={theme}
        style={{
          background: dark ? BRAND.black : BRAND.white,
          border: dark ? "none" : "1px solid #E5E5E5",
          borderRadius: 16,
          padding: "40px 24px",
          display: "grid",
          gap: 48,
          justifyItems: "center",
        }}
      >
        <Bolsa360Lockup key={`o${run}`} symbol="orbit" theme={theme} mode={mode === "morph" ? "loading" : mode} size={200} />
        <Bolsa360Lockup key={`b${run}`} symbol="b" orientation="horizontal" theme={theme} mode={mode} size={96} tagline={false} />
      </section>
    );
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "Poppins, system-ui, sans-serif" }}>
      <div role="group" aria-label="Modo de animação" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {MODES.map((o) => (
          <button
            key={o.id}
            aria-pressed={mode === o.id}
            onClick={() => pick(o.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: `2px solid ${BRAND.black}`,
              background: mode === o.id ? BRAND.yellow : "transparent",
              color: BRAND.black,
              fontFamily: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {panel("light")}
        {panel("dark")}
      </div>
    </main>
  );
}
