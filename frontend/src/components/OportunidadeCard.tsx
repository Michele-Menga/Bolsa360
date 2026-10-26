import { Link, useNavigate } from "react-router-dom";
import { CalendarClock, Globe2, Heart, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/misc";
import { useAuth } from "@/auth/AuthContext";
import { useFavoritos, useToggleFavorito } from "@/lib/queries";
import { data, diasAte, dinheiro, ELEGIBILIDADE, nomePais, PRAZO } from "@/lib/format";
import type { Elegibilidade, EstadoPrazo } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CardOp = {
  id: string; titulo: string; entidadeFinanciadora: string; tipo: { nome: string };
  valorFinanciamento: string | null; moeda: string | null; prazoCandidatura: string | null; estadoPrazo: EstadoPrazo;
  paisDestinoCodigo?: string | null; elegibilidadeAngolanos?: Elegibilidade;
};

export function FavoritoBotao({ id, className }: { id: string; className?: string }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const { data: favs } = useFavoritos();
  const tog = useToggleFavorito();
  const ativo = !!favs?.some((f) => f.id === id);
  const pendente = tog.isPending && tog.variables?.id === id;
  const estado = pendente ? !ativo : ativo; // atualização otimista visual
  if (user && user.papel !== "CANDIDATO") return null; // favoritos só para estudantes
  return (
    <button
      aria-pressed={estado} aria-label={estado ? "Remover dos favoritos" : "Guardar nos favoritos"}
      onClick={(e) => { e.preventDefault(); if (!user) return nav("/entrar", { state: { de: "/oportunidades" } }); tog.mutate({ id, ativo }); }}
      className={cn("grid h-10 w-10 place-items-center rounded-full border border-line bg-white transition hover:scale-110 active:scale-90", className)}
    >
      <Heart className={cn("h-5 w-5 transition", estado ? "fill-brand stroke-ink" : "stroke-ink")} />
    </button>
  );
}

export function OportunidadeCard({ o, mostrarFavorito = true }: { o: CardOp; mostrarFavorito?: boolean }) {
  const p = PRAZO[o.estadoPrazo];
  const dias = o.estadoPrazo === "ABERTO" ? diasAte(o.prazoCandidatura) : null;
  return (
    <Link to={`/oportunidades/${o.id}`} className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-ink hover:shadow-lg">
      <div className="mb-3 flex flex-wrap items-center gap-2 pr-12">
        <Badge tom={p.tom}>{p.label}</Badge>
        {o.elegibilidadeAngolanos && <Badge tom={ELEGIBILIDADE[o.elegibilidadeAngolanos].tom}>{ELEGIBILIDADE[o.elegibilidadeAngolanos].label}</Badge>}
      </div>
      {mostrarFavorito && <FavoritoBotao id={o.id} className="absolute right-4 top-4" />}
      <h3 className="text-lg font-semibold leading-snug group-hover:underline decoration-brand decoration-4 underline-offset-4">{o.titulo}</h3>
      <p className="mt-1 text-sm text-mute">{o.entidadeFinanciadora} · {o.tipo.nome}</p>
      <dl className="mt-auto grid gap-1.5 pt-5 text-sm">
        <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-brand-dark" /><dd>{dinheiro(o.valorFinanciamento, o.moeda)}</dd></div>
        <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-brand-dark" />
          <dd>{o.prazoCandidatura ? `Até ${data(o.prazoCandidatura)}` : "Prazo por confirmar"}{dias !== null && dias >= 0 && dias <= 30 && <b className="ml-2 text-amber-700">· {dias === 0 ? "termina hoje" : `${dias} dias`}</b>}</dd></div>
        {o.paisDestinoCodigo !== undefined && <div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-brand-dark" /><dd>{nomePais(o.paisDestinoCodigo)}</dd></div>}
      </dl>
    </Link>
  );
}
