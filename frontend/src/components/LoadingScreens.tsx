import { useEffect, useState, type ReactNode } from "react";
import { BMark, Bolsa360Loader, OrbitLogo } from "@/components/brand/Bolsa360Logos";

/** Ecrã inicial: anéis a orbitar enquanto a sessão é verificada. */
export function BootScreen({ label = "A preparar o teu futuro…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-[100] grid place-items-center bg-ink animate-fade">
      <div className="flex flex-col items-center gap-8">
        <BMark size={168} theme="dark" mode="morph" loop={false} duration={1.4} title="" />
        <div className="text-center">
          <p className="text-3xl font-bold tracking-wide text-white">BOLSA<span className="text-brand">360</span></p>
          <p className="mt-3 text-xs font-light tracking-[.2em] text-white/70">{label.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}

/** Fallback de rotas (lazy) e carregamentos de secção. */
export const PageLoader = ({ label = "A carregar…" }: { label?: string }) => (
  <div className="grid min-h-[50vh] place-items-center py-16"><Bolsa360Loader label={label} size={96} /></div>
);

/** Carregamento inline pequeno (listas, filtros). */
export const InlineLoader = ({ label }: { label: string }) => (
  <span role="status" className="inline-flex items-center gap-2 text-sm text-mute">
    <OrbitLogo size={22} mode="loading" title="" />{label}
  </span>
);

/** Sobreposição de processamento: B → livro enquanto uma ação decorre; fica no livro ao concluir. */
export function ProcessingOverlay({ open, done, label, doneLabel, children }: {
  open: boolean; done?: boolean; label: string; doneLabel?: string; children?: ReactNode;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => { if (open) setVis(true); else { const t = setTimeout(() => setVis(false), 250); return () => clearTimeout(t); } }, [open]);
  if (!vis) return null;
  return (
    <div role="status" aria-live="polite" className={`fixed inset-0 z-[90] grid place-items-center bg-white/90 backdrop-blur-sm transition-opacity ${open ? "animate-fade" : "opacity-0"}`}>
      <div className="flex flex-col items-center gap-5 text-center">
        <BMark key={done ? "fim" : "run"} size={132} mode="morph" loop={!done} title="" />
        <p className="text-lg font-semibold">{done ? doneLabel ?? "Concluído!" : label}</p>
        {children}
      </div>
    </div>
  );
}
