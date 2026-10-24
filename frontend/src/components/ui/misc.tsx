import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tons = {
  ok: "bg-emerald-100 text-emerald-800", warn: "bg-brand-soft text-amber-800", off: "bg-line text-mute",
  info: "bg-sky-100 text-sky-800", dark: "bg-ink text-white", brand: "bg-brand text-ink",
};
export const Badge = ({ tom = "off", className, ...p }: HTMLAttributes<HTMLSpanElement> & { tom?: keyof typeof tons }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tons[tom], className)} {...p} />
);
export const Card = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-2xl border border-line bg-white p-5 shadow-sm", className)} {...p} />
);
export const Skeleton = ({ className }: { className?: string }) => <div aria-hidden className={cn("animate-pulse rounded-xl bg-line/80", className)} />;
export const Vazio = ({ titulo, texto, children }: { titulo: string; texto?: string; children?: React.ReactNode }) => (
  <div className="rounded-2xl border-2 border-dashed border-line p-10 text-center">
    <p className="font-semibold">{titulo}</p>{texto && <p className="mt-1 text-sm text-mute">{texto}</p>}
    {children && <div className="mt-4 flex justify-center">{children}</div>}
  </div>
);
export const ErroCaixa = ({ erro }: { erro: unknown }) => (
  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {(erro as Error)?.message ?? "Ocorreu um erro."}
  </div>
);
