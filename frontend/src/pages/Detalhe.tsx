import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, CheckCircle2, ExternalLink, FileText, Globe2, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, ErroCaixa, Skeleton } from "@/components/ui/misc";
import { FavoritoBotao } from "@/components/OportunidadeCard";
import { ProcessingOverlay } from "@/components/LoadingScreens";
import { useAuth } from "@/auth/AuthContext";
import { temAreaDeCandidato } from "@/auth/destino";
import { useCandidaturas, useCriarCandidatura, useOportunidade } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import { data, dinheiro, ELEGIBILIDADE, FINANCIAMENTO, MODALIDADE, nomePais, PRAZO } from "@/lib/format";

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Detalhe() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { data: o, isLoading, error } = useOportunidade(id);
  const { data: cands } = useCandidaturas();
  const criar = useCriarCandidatura();
  const [fase, setFase] = useState<"idle" | "a" | "ok">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const podePlanear = !user || temAreaDeCandidato(user.papel); // ADMIN e MENTOR só consultam
  const existente = cands?.find((c) => c.oportunidade.id === id && !["CANCELADA", "REJEITADA"].includes(c.estado));

  async function planear() {
    if (!user) return nav("/entrar", { state: { de: `/oportunidades/${id}` } });
    setErro(null); setFase("a");
    try {
      await Promise.all([criar.mutateAsync(id!), espera(1600)]); // tempo mínimo para a animação B → livro ser vista
      setFase("ok"); await espera(1500); nav("/painel?tab=candidaturas");
    } catch (e) {
      setFase("idle");
      setErro(e instanceof ApiError && e.codigo === "CANDIDATURA_DUPLICADA" ? "Já tens uma candidatura ativa para esta oportunidade." : (e as Error).message);
    }
  }

  if (isLoading) return <div className="mx-auto max-w-4xl space-y-4 px-4 py-10"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-64" /></div>;
  if (error || !o) return <div className="mx-auto max-w-4xl px-4 py-10 space-y-4"><ErroCaixa erro={error ?? new Error("Oportunidade não encontrada.")} /><Link to="/oportunidades" className="underline">Voltar ao catálogo</Link></div>;

  const p = PRAZO[o.estadoPrazo]; const el = ELEGIBILIDADE[o.elegibilidadeAngolanos];
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ProcessingOverlay open={fase !== "idle"} done={fase === "ok"} label="A preparar a tua candidatura…" doneLabel="Candidatura planeada! A abrir o teu painel…" />
      <Link to="/oportunidades" className="mb-6 inline-flex items-center gap-1 text-sm font-medium hover:underline"><ArrowLeft className="h-4 w-4" />Todas as oportunidades</Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <header>
            <div className="mb-3 flex flex-wrap gap-2"><Badge tom={p.tom}>{p.label}</Badge><Badge tom={el.tom}>{el.label}</Badge><Badge tom="dark">{o.tipo.nome}</Badge>
              {o.categorias.map((c) => <Badge key={c.slug} tom="warn">{c.nome}</Badge>)}</div>
            <h1 className="text-3xl font-bold leading-tight">{o.titulo}</h1>
            <p className="mt-1 text-mute">{o.entidadeFinanciadora}{o.cicloAno ? ` · ${o.cicloAno}` : ""}</p>
          </header>
          <Card><h2 className="mb-2 font-semibold">Sobre a oportunidade</h2><p className="whitespace-pre-line text-sm leading-relaxed text-ink/85">{o.descricao}</p></Card>

          {o.regras.length > 0 && <Card><h2 className="mb-3 font-semibold">Requisitos e regras</h2><ul className="space-y-3">
            {o.regras.map((r, i) => (<li key={i} className="flex gap-3 text-sm">
              {r.estadoConfirmacao === "CONFIRMADA" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <ShieldQuestion className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}
              <span><b>{r.tipoRegra.replaceAll("_", " ").toLowerCase()}</b> {r.operador.replaceAll("_", " ").toLowerCase()}{" "}
                {r.valorTexto ?? r.valorNumerico ?? [r.valorMinimo, r.valorMaximo].filter(Boolean).join(" – ")}
                {r.estadoConfirmacao !== "CONFIRMADA" && <em className="ml-2 text-xs text-amber-700">por confirmar</em>}</span></li>))}</ul></Card>}

          {o.documentosExigidos.length > 0 && <Card><h2 className="mb-3 font-semibold">Documentos exigidos</h2><ul className="grid gap-2 sm:grid-cols-2">
            {o.documentosExigidos.map((d) => (<li key={d.nome} className="flex gap-2 rounded-xl bg-line/40 p-3 text-sm"><FileText className="mt-0.5 h-4 w-4 shrink-0" />
              <span><b>{d.nome}</b>{!d.obrigatorio && <span className="text-mute"> (opcional)</span>}{d.descricao && <span className="block text-xs text-mute">{d.descricao}</span>}</span></li>))}</ul></Card>}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="space-y-4">
            <div><p className="text-xs text-mute">Financiamento</p><p className="text-xl font-bold">{dinheiro(o.valorFinanciamento, o.moeda)}</p><p className="text-sm text-mute">{FINANCIAMENTO[o.tipoFinanciamento]}</p></div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-brand-dark" />Abre: {data(o.dataAbertura)}</li>
              <li className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-brand-dark" />Prazo: <b>{data(o.prazoCandidatura)}</b></li>
              <li className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-brand-dark" />{nomePais(o.paisDestinoCodigo)} · {MODALIDADE[o.modalidade ?? "NAO_APLICAVEL"]}</li>
            </ul>
            {erro && <ErroCaixa erro={new Error(erro)} />}
            {podePlanear && (existente
              ? <Link to="/painel?tab=candidaturas" className="block"><Button variant="dark" className="w-full">Ver a minha candidatura</Button></Link>
              : <Button className="w-full" size="lg" onClick={planear} disabled={o.estadoPrazo === "EXPIRADO"}>{o.estadoPrazo === "EXPIRADO" ? "Prazo terminado" : "Planear candidatura"}</Button>)}
            <div className="flex gap-2">
              {podePlanear && <FavoritoBotao id={o.id} />}
              <a href={o.urlCandidatura ?? o.urlFonteOficial} target="_blank" rel="noreferrer" className="flex-1"><Button variant="outline" className="w-full"><ExternalLink className="h-4 w-4" />Site oficial</Button></a>
            </div>
            <p className="text-xs text-mute">Última verificação: {data(o.ultimaVerificacaoEm)}. Confirma sempre os detalhes na fonte oficial.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
