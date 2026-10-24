import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Skeleton, Vazio, ErroCaixa } from "@/components/ui/misc";
import { InlineLoader } from "@/components/LoadingScreens";
import { OportunidadeCard } from "@/components/OportunidadeCard";
import { useOportunidades, useReferencias } from "@/lib/queries";
import { ELEGIBILIDADE, FINANCIAMENTO, PAISES, PRAZO } from "@/lib/format";
import { useEffect, useState } from "react";

const CHAVES = ["q", "tipo", "nivel", "paisDestino", "financiamento", "elegibilidadeAngolanos", "estadoPrazo", "ordenar", "pagina"] as const;

export default function Catalogo() {
  const [sp, setSp] = useSearchParams();
  const f: Record<string, string | undefined> = Object.fromEntries(CHAVES.map((k) => [k, sp.get(k) ?? undefined]));
  const [q, setQ] = useState(f.q ?? "");
  const { data, isLoading, isFetching, error } = useOportunidades({ ...f, limite: "9" });
  const ref = useReferencias();

  const set = (k: string, v: string) => setSp((p) => { v ? p.set(k, v) : p.delete(k); if (k !== "pagina") p.delete("pagina"); return p; }, { replace: true });
  // pesquisa com debounce para não disparar um pedido por tecla
  useEffect(() => { const t = setTimeout(() => q !== (f.q ?? "") && set("q", q.trim()), 400); return () => clearTimeout(t); }, [q]); // eslint-disable-line
  const ativos = CHAVES.filter((k) => k !== "pagina" && k !== "ordenar" && f[k]).length;
  const pagina = Number(f.pagina ?? 1);

  const sel = (k: string, label: string, opts: [string, string][]) => (
    <Select aria-label={label} value={f[k] ?? ""} onChange={(e) => set(k, e.target.value)}>
      <option value="">{label}</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </Select>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Oportunidades</h1>
          <p className="text-sm text-mute">{data ? `${data.meta.total} resultado${data.meta.total === 1 ? "" : "s"}` : "A procurar…"}</p></div>
        {isFetching && !isLoading && <InlineLoader label="A atualizar…" />}
      </div>

      <div className="mb-8 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-4">
        <Input aria-label="Pesquisar" maxLength={200} className="md:col-span-2" placeholder="Pesquisar por título ou entidade…" value={q} onChange={(e) => setQ(e.target.value)} />
        {sel("tipo", "Tipo", (ref.data?.tipos ?? []).map((t) => [t.codigo, t.nome]))}
        {sel("nivel", "Nível de ensino", (ref.data?.niveis ?? []).map((n) => [n.codigo, n.nome]))}
        {sel("paisDestino", "País de destino", Object.entries(PAISES))}
        {sel("financiamento", "Financiamento", Object.entries(FINANCIAMENTO))}
        {sel("estadoPrazo", "Estado do prazo", Object.entries(PRAZO).map(([k, v]) => [k, v.label]))}
        {sel("elegibilidadeAngolanos", "Elegibilidade (angolanos)", Object.entries(ELEGIBILIDADE).map(([k, v]) => [k, v.label]))}
        <div className="flex gap-2">
          <Select aria-label="Ordenar" value={f.ordenar ?? "prazo"} onChange={(e) => set("ordenar", e.target.value)}>
            <option value="prazo">Por prazo</option><option value="recentes">Mais recentes</option></Select>
          {ativos > 0 && <Button variant="outline" size="sm" className="h-auto shrink-0" aria-label="Limpar filtros" onClick={() => { setQ(""); setSp({}, { replace: true }); }}><FilterX className="h-4 w-4" /></Button>}
        </div>
      </div>

      {error ? <ErroCaixa erro={error} /> : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : data!.data.length === 0 ? (
        <Vazio titulo="Nenhuma oportunidade encontrada" texto="Experimenta remover alguns filtros ou procurar por outro termo."><Button variant="outline" onClick={() => { setQ(""); setSp({}); }}>Limpar filtros</Button></Vazio>
      ) : (
        <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {data!.data.map((o, i) => <div key={o.id} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}><OportunidadeCard o={o} /></div>)}
        </div>
      )}

      {data && data.meta.totalPaginas > 1 && (
        <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => set("pagina", String(pagina - 1))}><ChevronLeft className="h-4 w-4" />Anterior</Button>
          <span className="text-sm text-mute">Página {data.meta.pagina} de {data.meta.totalPaginas}</span>
          <Button variant="outline" size="sm" disabled={pagina >= data.meta.totalPaginas} onClick={() => set("pagina", String(pagina + 1))}>Seguinte<ChevronRight className="h-4 w-4" /></Button>
        </nav>
      )}
    </div>
  );
}
