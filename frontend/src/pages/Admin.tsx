import { useEffect, useState, type FormEvent } from "react";
import { Archive, BookCheck, FilePlus2, Pencil, Search, Send, Users, X, ClipboardCheck, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Badge, Card, ErroCaixa, Skeleton, Vazio } from "@/components/ui/misc";
import { PageLoader, ProcessingOverlay } from "@/components/LoadingScreens";
import { useAdminAcao, useMetricas, useOportunidadeAdmin, useOportunidadesAdmin, useReferencias } from "@/lib/queries";
import { data, dinheiro, EDITORIAL, FINANCIAMENTO, MODALIDADE, PAISES } from "@/lib/format";
import type { EstadoEditorial, OportunidadeAdminDetalhe } from "@/lib/types";

const TOM: Record<EstadoEditorial, "ok" | "warn" | "off" | "info" | "brand"> = {
  PUBLICADA: "ok", RASCUNHO: "info", PENDENTE: "warn", VERIFICADA: "brand", REJEITADA: "off", ARQUIVADA: "off",
};
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

const VAZIO = { titulo: "", entidadeFinanciadora: "", tipoOportunidadeId: "", descricao: "", nivelEnsinoId: "", paisDestinoCodigo: "", modalidade: "",
  tipoFinanciamento: "INTEGRAL", valorFinanciamento: "", moeda: "", dataAbertura: "", prazoCandidatura: "", cicloAno: "", urlFonteOficial: "", urlCandidatura: "" };
type Form = typeof VAZIO;
// Pré-preenche a edição com o registo completo (GET /admin/oportunidades/:id): descrição, nível, país e modalidade incluídos.
const paraForm = (o: OportunidadeAdminDetalhe): Form => ({ ...VAZIO, titulo: o.titulo, entidadeFinanciadora: o.entidadeFinanciadora,
  tipoOportunidadeId: o.tipoOportunidadeId, descricao: o.descricao, nivelEnsinoId: o.nivelEnsinoId ?? "", paisDestinoCodigo: o.paisDestinoCodigo ?? "",
  modalidade: o.modalidade ?? "", tipoFinanciamento: o.tipoFinanciamento,
  valorFinanciamento: o.valorFinanciamento ?? "", moeda: o.moeda ?? "", dataAbertura: o.dataAbertura?.slice(0, 10) ?? "", prazoCandidatura: o.prazoCandidatura?.slice(0, 10) ?? "",
  cicloAno: o.cicloAno ?? "", urlFonteOficial: o.urlFonteOficial, urlCandidatura: o.urlCandidatura ?? "" });

function Formulario({ inicial, id, onFechar, onGuardado }: { inicial: Form; id?: string; onFechar: () => void; onGuardado: (msg: string) => void }) {
  const acao = useAdminAcao();
  const ref = useReferencias();
  const [f, setF] = useState(inicial);
  // Nova oportunidade: o tipo por omissão é o primeiro da lista vinda da API.
  useEffect(() => { const t = ref.data?.tipos[0]; if (t && !f.tipoOportunidadeId) setF((x) => ({ ...x, tipoOportunidadeId: t.id })); }, [ref.data]); // eslint-disable-line
  const set = (k: keyof Form) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });
  const mut = id ? acao.atualizar : acao.criar;

  async function submeter(e: FormEvent) {
    e.preventDefault();
    // Só envia campos preenchidos; na edição, só os que mudaram (PATCH parcial, schema estrito).
    const corpo: Record<string, string> = {};
    (Object.keys(f) as (keyof Form)[]).forEach((k) => { const v = typeof f[k] === "string" ? f[k].trim() : f[k]; if (v && (!id || v !== inicial[k])) corpo[k] = v; });
    if (id && !Object.keys(corpo).length) return onFechar();
    try {
      await Promise.all([mut.mutateAsync(id ? { id, ...corpo } : corpo), espera(1300)]);
      onGuardado(id ? "Oportunidade atualizada." : "Rascunho criado. Publica-o quando estiver pronto.");
    } catch { /* o erro do backend aparece em <ErroCaixa erro={mut.error} /> */ }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 p-4 animate-fade" role="dialog" aria-modal="true" aria-label={id ? "Editar oportunidade" : "Nova oportunidade"}>
      <ProcessingOverlay open={mut.isPending} label={id ? "A guardar alterações…" : "A criar rascunho…"} />
      <form onSubmit={submeter} className="mx-auto my-6 max-w-3xl space-y-4 rounded-2xl bg-white p-6 animate-rise">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{id ? "Editar oportunidade" : "Nova oportunidade"}</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="rounded-full p-2 hover:bg-line"><X /></button></div>
        {mut.error && <ErroCaixa erro={mut.error} />}
        {ref.error && <ErroCaixa erro={ref.error} />}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título *">{(i) => <Input id={i} required minLength={3} maxLength={200} value={f.titulo} onChange={set("titulo")} />}</Field>
          <Field label="Entidade financiadora *">{(i) => <Input id={i} required minLength={2} maxLength={200} value={f.entidadeFinanciadora} onChange={set("entidadeFinanciadora")} />}</Field>
          <Field label="Tipo *">{(i) => <Select id={i} required value={f.tipoOportunidadeId} onChange={set("tipoOportunidadeId")}>{(ref.data?.tipos ?? []).map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</Select>}</Field>
          <Field label="Nível de ensino">{(i) => <Select id={i} value={f.nivelEnsinoId} onChange={set("nivelEnsinoId")}><option value="">—</option>{(ref.data?.niveis ?? []).map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}</Select>}</Field>
          <Field label="Tipo de financiamento *">{(i) => <Select id={i} value={f.tipoFinanciamento} onChange={set("tipoFinanciamento")}>{Object.entries(FINANCIAMENTO).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</Select>}</Field>
          <Field label="Modalidade">{(i) => <Select id={i} value={f.modalidade} onChange={set("modalidade")}><option value="">—</option>{Object.entries(MODALIDADE).map(([k, n]) => <option key={k} value={k}>{k === "NAO_APLICAVEL" ? "Não aplicável" : n}</option>)}</Select>}</Field>
          <Field label="Valor" dica="Ex.: 12000 ou 12000.50">{(i) => <Input id={i} inputMode="decimal" pattern="\d+(\.\d{1,2})?" value={f.valorFinanciamento} onChange={set("valorFinanciamento")} />}</Field>
          <Field label="Moeda" dica="3 letras, ex.: EUR">{(i) => <Input id={i} maxLength={3} minLength={3} className="uppercase" value={f.moeda} onChange={set("moeda")} />}</Field>
          <Field label="País de destino">{(i) => <Select id={i} value={f.paisDestinoCodigo} onChange={set("paisDestinoCodigo")}><option value="">—</option>{Object.entries(PAISES).map(([c, n]) => <option key={c} value={c}>{n}</option>)}</Select>}</Field>
          <Field label="Ciclo / ano">{(i) => <Input id={i} maxLength={20} value={f.cicloAno} onChange={set("cicloAno")} />}</Field>
          <Field label="Abertura">{(i) => <Input id={i} type="date" value={f.dataAbertura} onChange={set("dataAbertura")} />}</Field>
          <Field label="Prazo de candidatura">{(i) => <Input id={i} type="date" value={f.prazoCandidatura} onChange={set("prazoCandidatura")} />}</Field>
          <Field label="URL da fonte oficial *">{(i) => <Input id={i} required type="url" value={f.urlFonteOficial} onChange={set("urlFonteOficial")} />}</Field>
          <Field label="URL de candidatura">{(i) => <Input id={i} type="url" value={f.urlCandidatura} onChange={set("urlCandidatura")} />}</Field>
        </div>
        <Field label="Descrição *" dica="Mínimo de 10 caracteres.">
          {(i) => <Textarea id={i} required minLength={10} value={f.descricao} onChange={set("descricao")} />}</Field>
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onFechar}>Cancelar</Button><Button type="submit" disabled={!f.tipoOportunidadeId}>{id ? "Guardar alterações" : "Criar rascunho"}</Button></div>
      </form>
    </div>
  );
}

function EditarOportunidade({ id, onFechar, onGuardado }: { id: string; onFechar: () => void; onGuardado: (msg: string) => void }) {
  const det = useOportunidadeAdmin(id);
  if (det.data) return <Formulario inicial={paraForm(det.data)} id={id} onFechar={onFechar} onGuardado={onGuardado} />;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/60 p-4 animate-fade" role="dialog" aria-modal="true" aria-label="A carregar oportunidade">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 text-center">
        {det.error ? <><ErroCaixa erro={det.error} /><Button variant="outline" onClick={onFechar}>Fechar</Button></> : <PageLoader label="A carregar oportunidade…" />}
      </div>
    </div>
  );
}

type Aviso = { erro: boolean; texto: string } | null;

export default function Admin() {
  const metricas = useMetricas();
  const [estado, setEstado] = useState(""); const [q, setQ] = useState(""); const [busca, setBusca] = useState(""); const [pagina, setPagina] = useState(1);
  // pesquisa com debounce: um pedido por pausa a escrever, não um por tecla
  useEffect(() => { const t = setTimeout(() => { setBusca(q.trim()); setPagina(1); }, 400); return () => clearTimeout(t); }, [q]);
  const lista = useOportunidadesAdmin({ estadoEditorial: estado || undefined, pesquisa: busca || undefined, pagina: String(pagina), limite: "10" });
  const acao = useAdminAcao();
  const [form, setForm] = useState<{ id?: string } | null>(null);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [a, setA] = useState<string | null>(null);

  async function executar(rotulo: string, fn: () => Promise<unknown>) {
    setA(rotulo); setAviso(null);
    try { await Promise.all([fn(), espera(1200)]); setAviso({ erro: false, texto: "Feito." }); } catch (e) { setAviso({ erro: true, texto: (e as Error).message }); } finally { setA(null); }
  }
  const cartoes = [["Utilizadores", metricas.data?.utilizadores, Users], ["Oportunidades", metricas.data?.oportunidades, BookCheck], ["Pendências", metricas.data?.pendencias, Hourglass], ["Candidaturas", metricas.data?.candidaturas, ClipboardCheck]] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ProcessingOverlay open={!!a} label={a ?? ""} />
      {form && (form.id
        ? <EditarOportunidade id={form.id} onFechar={() => setForm(null)} onGuardado={(m) => { setForm(null); setAviso({ erro: false, texto: m }); }} />
        : <Formulario inicial={VAZIO} onFechar={() => setForm(null)} onGuardado={(m) => { setForm(null); setAviso({ erro: false, texto: m }); }} />)}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Administração</h1>
        <Button onClick={() => setForm({})}><FilePlus2 className="h-4 w-4" />Nova oportunidade</Button></div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cartoes.map(([l, v, Icon]) => (<Card key={l} className="flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-full bg-brand"><Icon className="h-5 w-5" /></span>
          <div><p className="text-2xl font-bold leading-none">{metricas.isLoading ? <Skeleton className="h-6 w-10" /> : v ?? "–"}</p><p className="mt-1 text-xs text-mute">{l}</p></div></Card>))}
      </div>
      {metricas.error && <ErroCaixa erro={metricas.error} />}
      {aviso && (aviso.erro ? <div className="mb-4"><ErroCaixa erro={new Error(aviso.texto)} /></div>
        : <div role="status" className="mb-4 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium">{aviso.texto}</div>)}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-mute" /><Input aria-label="Pesquisar" className="pl-9" placeholder="Pesquisar título ou entidade…" value={q} onChange={(e) => setQ(e.target.value)} maxLength={200} /></div>
        <Select aria-label="Estado editorial" className="w-48" value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1); }}><option value="">Todos os estados</option>
          {Object.entries(EDITORIAL).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</Select>
      </div>

      {lista.error ? <ErroCaixa erro={lista.error} /> : lista.isLoading ? <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20" />)}</div>
        : !lista.data!.data.length ? <Vazio titulo="Sem oportunidades neste filtro" /> : (
        <ul className="space-y-3">{lista.data!.data.map((o) => (
          <Card key={o.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1"><p className="truncate font-semibold">{o.titulo}</p>
              <p className="truncate text-sm text-mute">{o.entidadeFinanciadora} · {o.tipo.nome} · {dinheiro(o.valorFinanciamento, o.moeda)} · prazo {data(o.prazoCandidatura)}</p></div>
            <Badge tom={TOM[o.estadoEditorial]}>{EDITORIAL[o.estadoEditorial]}</Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" aria-label={`Editar ${o.titulo}`} onClick={() => setForm({ id: o.id })}><Pencil className="h-4 w-4" /></Button>
              {o.estadoEditorial !== "PUBLICADA" && o.estadoEditorial !== "ARQUIVADA" && <Button size="sm" onClick={() => executar("A publicar oportunidade…", () => acao.publicar.mutateAsync(o.id))}><Send className="h-4 w-4" />Publicar</Button>}
              {o.estadoEditorial === "PUBLICADA" && <Button size="sm" variant="outline" onClick={() => executar("A arquivar oportunidade…", () => acao.arquivar.mutateAsync(o.id))}><Archive className="h-4 w-4" />Arquivar</Button>}
            </div>
          </Card>))}</ul>)}

      {lista.data && lista.data.meta.totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <Button size="sm" variant="outline" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</Button>
          <span className="text-mute">Página {pagina} de {lista.data.meta.totalPaginas}</span>
          <Button size="sm" variant="outline" disabled={pagina >= lista.data.meta.totalPaginas} onClick={() => setPagina(pagina + 1)}>Seguinte</Button></div>)}
    </div>
  );
}
