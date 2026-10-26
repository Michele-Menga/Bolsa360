import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ChevronDown, Heart, UserRound, ClipboardList, Video, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Badge, Card, ErroCaixa, Skeleton, Vazio } from "@/components/ui/misc";
import { OportunidadeCard } from "@/components/OportunidadeCard";
import { PageLoader } from "@/components/LoadingScreens";
import { useAuth } from "@/auth/AuthContext";
import { useAtualizarCandidatura, useCandidatura, useCandidaturas, useFavoritos, useGuardarPerfil, usePerfil, useReferencias } from "@/lib/queries";
import { CANDIDATURA, data, dinheiro, PAISES } from "@/lib/format";
import { SESSAO, useMinhasMentorias, useCandidatoMentoriaAcoes, type AgendamentoCandidato, type EstadoAgendamento } from "@/lib/mentor";
import type { Candidatura, EstadoCandidatura } from "@/lib/types";
import { cn } from "@/lib/utils";

const SESSAO_TOM: Record<EstadoAgendamento, "ok" | "warn" | "off" | "brand"> = {
  PENDENTE_PAGAMENTO: "warn", CONFIRMADO: "ok", CONCLUIDO: "brand", CANCELADO: "off",
};

const ESTADOS = Object.keys(CANDIDATURA) as EstadoCandidatura[];
const TOM: Record<EstadoCandidatura, "ok" | "warn" | "off" | "info" | "brand"> = {
  PLANEADA: "info", EM_PREPARACAO: "warn", SUBMETIDA_EXTERNAMENTE: "brand", EM_AVALIACAO: "brand", ACEITE: "ok", REJEITADA: "off", CANCELADA: "off",
};

function CandidaturaItem({ c }: { c: Candidatura }) {
  const [aberta, setAberta] = useState(false);
  const det = useCandidatura(aberta ? c.id : undefined);
  const upd = useAtualizarCandidatura();
  const [notas, setNotas] = useState(c.notasPrivadas ?? "");
  const [guardado, setGuardado] = useState(false);
  const mudar = (estado: EstadoCandidatura) => upd.mutate({ id: c.id, estado, notasPrivadas: notas });
  const guardarNotas = async () => { await upd.mutateAsync({ id: c.id, estado: c.estado, notasPrivadas: notas }); setGuardado(true); setTimeout(() => setGuardado(false), 1800); };

  return (
    <Card className="p-0">
      <button className="flex w-full items-center gap-3 p-5 text-left" aria-expanded={aberta} onClick={() => setAberta((v) => !v)}>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{c.oportunidade.titulo}</p>
          <p className="truncate text-sm text-mute">{c.oportunidade.entidadeFinanciadora} · prazo {data(c.oportunidade.prazoCandidatura)}</p>
        </div>
        <Badge tom={TOM[c.estado]}>{CANDIDATURA[c.estado]}</Badge>
        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", aberta && "rotate-180")} />
      </button>
      {aberta && (
        <div className="space-y-5 border-t border-line p-5 animate-fade">
          {upd.error && <ErroCaixa erro={upd.error} />}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Estado da candidatura">{(id) => (
              <Select id={id} value={c.estado} disabled={upd.isPending} onChange={(e) => mudar(e.target.value as EstadoCandidatura)}>
                {ESTADOS.map((s) => <option key={s} value={s}>{CANDIDATURA[s]}</option>)}</Select>)}</Field>
            <div className="text-sm"><p className="font-medium">Datas</p><p className="text-mute">Criada em {data(c.criadoEm)}{c.dataSubmissaoExterna && <> · submetida em {data(c.dataSubmissaoExterna)}</>}</p>
              <Link to={`/oportunidades/${c.oportunidade.id}`} className="mt-1 inline-block font-semibold underline decoration-brand decoration-2">Ver oportunidade</Link></div>
          </div>
          <Field label="Notas privadas" dica="Só tu vês estas notas.">{(id) => <Textarea id={id} maxLength={2000} value={notas} onChange={(e) => setNotas(e.target.value)} />}</Field>
          <Button size="sm" variant="dark" loading={upd.isPending} onClick={guardarNotas}>{guardado ? <><Check className="h-4 w-4" />Guardado</> : "Guardar notas"}</Button>
          <div><p className="mb-2 text-sm font-medium">Histórico</p>
            {det.isLoading ? <Skeleton className="h-16" /> : (
              <ol className="space-y-2 border-l-2 border-brand pl-4">
                {det.data?.historico?.map((h, i) => (<li key={i} className="text-sm"><b>{h.estadoAnterior ? `${CANDIDATURA[h.estadoAnterior]} → ` : ""}{CANDIDATURA[h.estadoNovo]}</b>
                  <span className="text-mute"> · {data(h.alteradoEm)}</span>{h.observacao && <span className="block text-xs text-mute">{h.observacao}</span>}</li>))}</ol>)}</div>
        </div>
      )}
    </Card>
  );
}

function Candidaturas() {
  const { data: cs, isLoading, error } = useCandidaturas();
  if (isLoading) return <PageLoader label="A carregar candidaturas…" />;
  if (error) return <ErroCaixa erro={error} />;
  if (!cs?.length) return <Vazio titulo="Ainda não planeaste nenhuma candidatura" texto="Escolhe uma oportunidade e carrega em “Planear candidatura”."><Link to="/oportunidades"><Button>Explorar oportunidades</Button></Link></Vazio>;
  const resumo = ESTADOS.map((s) => [s, cs.filter((c) => c.estado === s).length] as const).filter(([, n]) => n);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{resumo.map(([s, n]) => <Badge key={s} tom={TOM[s]}>{CANDIDATURA[s]} · {n}</Badge>)}</div>
      {cs.map((c) => <CandidaturaItem key={c.id} c={c} />)}
    </div>
  );
}

function Favoritos() {
  const { data: fs, isLoading, error } = useFavoritos();
  if (isLoading) return <PageLoader label="A carregar favoritos…" />;
  if (error) return <ErroCaixa erro={error} />;
  if (!fs?.length) return <Vazio titulo="Sem favoritos por agora" texto="Toca no coração de uma oportunidade para a guardares aqui."><Link to="/oportunidades"><Button>Explorar oportunidades</Button></Link></Vazio>;
  return <div className="grid gap-4 md:grid-cols-2">{fs.map((f) => <OportunidadeCard key={f.id} o={f} />)}</div>;
}

const IDIOMAS: [string, string][] = [["pt", "Português"], ["en", "Inglês"], ["fr", "Francês"], ["es", "Espanhol"]];

function Perfil() {
  const { data: perfil, isLoading, error } = usePerfil(true);
  const guardar = useGuardarPerfil();
  const ref = useReferencias();
  const [f, setF] = useState({ nacionalidadeCodigo: "AO", dataNascimento: "", nivelEnsinoAtualId: "", areaEstudo: "", instituicaoEnsino: "", paisDestinoPreferido: "", idiomas: {} as Record<string, string> });
  const [ok, setOk] = useState(false);
  useEffect(() => { if (perfil) setF({
    nacionalidadeCodigo: perfil.nacionalidadeCodigo, dataNascimento: perfil.dataNascimento?.slice(0, 10) ?? "", nivelEnsinoAtualId: perfil.nivelEnsinoAtualId ?? "",
    areaEstudo: perfil.areaEstudo ?? "", instituicaoEnsino: perfil.instituicaoEnsino ?? "", paisDestinoPreferido: perfil.paisDestinoPreferido ?? "", idiomas: perfil.idiomas ?? {} }); }, [perfil]);

  const campos = [f.dataNascimento, f.nivelEnsinoAtualId, f.areaEstudo, f.instituicaoEnsino, f.paisDestinoPreferido, Object.values(f.idiomas).some(Boolean) ? "x" : ""];
  const pct = Math.round(((1 + campos.filter(Boolean).length) / (1 + campos.length)) * 100);

  async function submeter(e: FormEvent) {
    e.preventDefault(); setOk(false);
    const idiomas = Object.fromEntries(Object.entries(f.idiomas).filter(([, v]) => v.trim()));
    // campos vazios são omitidos: o schema é estrito e não aceita strings vazias em ids/datas
    try { await guardar.mutateAsync({
      nacionalidadeCodigo: f.nacionalidadeCodigo,
      ...(f.dataNascimento && { dataNascimento: f.dataNascimento }), ...(f.nivelEnsinoAtualId && { nivelEnsinoAtualId: f.nivelEnsinoAtualId }),
      ...(f.areaEstudo.trim() && { areaEstudo: f.areaEstudo.trim() }), ...(f.instituicaoEnsino.trim() && { instituicaoEnsino: f.instituicaoEnsino.trim() }),
      ...(f.paisDestinoPreferido && { paisDestinoPreferido: f.paisDestinoPreferido }), ...(Object.keys(idiomas).length && { idiomas }),
    }); setOk(true); } catch { /* o erro do backend é mostrado em <ErroCaixa erro={guardar.error} /> */ }
  }
  if (isLoading) return <PageLoader label="A carregar perfil…" />;
  if (error) return <ErroCaixa erro={error} />;
  const set = (k: string) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={submeter} className="space-y-5">
      <div><div className="mb-1 flex justify-between text-sm"><span className="font-medium">Perfil completo</span><span>{pct}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${pct}%` }} /></div>
        {!perfil && <p className="mt-2 text-sm text-mute">Ainda não tens perfil. Preenche os dados abaixo para receberes melhores resultados.</p>}</div>
      {guardar.error && <ErroCaixa erro={guardar.error} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nacionalidade *">{(id) => <Select id={id} value={f.nacionalidadeCodigo} onChange={set("nacionalidadeCodigo")}>{Object.entries(PAISES).map(([c, n]) => <option key={c} value={c}>{n}</option>)}</Select>}</Field>
        <Field label="Data de nascimento">{(id) => <Input id={id} type="date" value={f.dataNascimento} onChange={set("dataNascimento")} />}</Field>
        <Field label="Nível de ensino atual">{(id) => <Select id={id} value={f.nivelEnsinoAtualId} onChange={set("nivelEnsinoAtualId")}><option value="">—</option>{(ref.data?.niveis ?? []).map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}</Select>}</Field>
        <Field label="Área de estudo">{(id) => <Input id={id} maxLength={100} value={f.areaEstudo} onChange={set("areaEstudo")} placeholder="Ex.: Engenharia Informática" />}</Field>
        <Field label="Instituição de ensino">{(id) => <Input id={id} maxLength={200} value={f.instituicaoEnsino} onChange={set("instituicaoEnsino")} />}</Field>
        <Field label="País de destino preferido">{(id) => <Select id={id} value={f.paisDestinoPreferido} onChange={set("paisDestinoPreferido")}><option value="">—</option>{Object.entries(PAISES).map(([c, n]) => <option key={c} value={c}>{n}</option>)}</Select>}</Field>
      </div>
      <fieldset><legend className="mb-2 text-sm font-medium">Idiomas (nível)</legend>
        <div className="grid gap-3 sm:grid-cols-4">{IDIOMAS.map(([c, n]) => <Input key={c} aria-label={n} placeholder={`${n} (ex.: B1)`} value={f.idiomas[c] ?? ""} onChange={(e) => setF({ ...f, idiomas: { ...f.idiomas, [c]: e.target.value } })} />)}</div></fieldset>
      <Button type="submit" loading={guardar.isPending}>{ok ? <><Check className="h-4 w-4" />Perfil guardado</> : "Guardar perfil"}</Button>
    </form>
  );
}

function SessaoEstudanteCard({ s }: { s: AgendamentoCandidato }) {
  const { cancelar } = useCandidatoMentoriaAcoes();
  const [aCancelar, setACancelar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const quando = new Date(s.inicio).toLocaleString("pt-AO", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-base">{s.servico.titulo}</p>
          <p className="text-sm text-mute">com o mentor <b>{s.mentor.nome}</b> · {quando}{s.servico.duracaoMinutos ? ` · ${s.servico.duracaoMinutos} min` : ""}</p>
        </div>
        <Badge tom={SESSAO_TOM[s.estado]}>{SESSAO[s.estado]}</Badge>
      </div>

      {s.estado === "PENDENTE_PAGAMENTO" && (
        <div className="rounded-xl border border-brand/30 bg-brand-soft/30 p-3 text-sm">
          <p className="font-medium text-ink">Solicitação enviada ao mentor</p>
          <p className="mt-0.5 text-xs text-mute">
            O mentor <b>{s.mentor.nome}</b> irá rever a tua solicitação e decidir se aceita. Assim que aceitar, o link da videochamada ficará disponível aqui.
          </p>
          {!aCancelar && (
            <div className="mt-2.5">
              <Button size="sm" variant="outline" onClick={() => setACancelar(true)}>
                Cancelar solicitação
              </Button>
            </div>
          )}
        </div>
      )}

      {s.estado === "CONFIRMADO" && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {s.linkReuniao ? (
            <a href={s.linkReuniao} target="_blank" rel="noreferrer">
              <Button size="sm">
                <Video className="h-4 w-4" />Entrar na videochamada<ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          ) : (
            <span className="text-xs text-mute">O link da videochamada está a ser gerado.</span>
          )}
          {!aCancelar && (
            <Button size="sm" variant="ghost" onClick={() => setACancelar(true)}>
              Cancelar sessão
            </Button>
          )}
        </div>
      )}

      {aCancelar && (
        <form
          className="space-y-2 rounded-xl bg-line/20 p-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await cancelar.mutateAsync({ id: s.id, motivo: motivo.trim() });
            setACancelar(false);
          }}
        >
          <Field label="Motivo do cancelamento">
            {(id) => (
              <Input
                id={id}
                required
                maxLength={200}
                placeholder="Ex.: Não terei disponibilidade neste horário"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            )}
          </Field>
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="danger" loading={cancelar.isPending}>Confirmar cancelamento</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setACancelar(false)}>Voltar</Button>
          </div>
        </form>
      )}

      {s.estado === "CANCELADO" && s.motivoCancelamento && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          <b>Motivo:</b> {s.motivoCancelamento}
        </p>
      )}
    </Card>
  );
}

function Mentorias() {
  const { data: sessoes, isLoading, error } = useMinhasMentorias();
  if (error) return <ErroCaixa erro={error} />;
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>;
  if (!sessoes?.length) {
    return (
      <Vazio
        titulo="Ainda não agendaste nenhuma mentoria"
        texto="Conecta-te com mentores para rever a tua candidatura ou simular entrevistas."
      >
        <Link to="/mentores">
          <Button variant="dark" className="mt-3">
            <Calendar className="h-4 w-4" />Explorar mentores
          </Button>
        </Link>
      </Vazio>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/mentores">
          <Button size="sm" variant="outline"><Calendar className="h-4 w-4" />Agendar nova mentoria</Button>
        </Link>
      </div>
      <div className="space-y-3">
        {sessoes.map((s) => (
          <SessaoEstudanteCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}

const TABS = [
  ["candidaturas", "Candidaturas", ClipboardList],
  ["mentorias", "As minhas mentorias", Video],
  ["favoritos", "Favoritos", Heart],
  ["perfil", "Perfil", UserRound],
] as const;

export default function Painel() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") ?? "candidaturas";
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Olá, {user?.nome.split(" ")[0]} <span className="text-brand">👋</span></h1>
      <p className="mb-6 text-mute">Acompanha as tuas candidaturas, mentorias e oportunidades guardadas.</p>
      <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map(([k, l, Icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setSp({ tab: k }, { replace: true })}
            className={cn("flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition", tab === k ? "bg-ink text-white" : "bg-line/60 hover:bg-line")}><Icon className="h-4 w-4" />{l}</button>))}
      </div>
      <div role="tabpanel" className="animate-fade" key={tab}>
        {tab === "favoritos" ? <Favoritos /> : tab === "perfil" ? <Perfil /> : tab === "mentorias" ? <Mentorias /> : <Candidaturas />}
      </div>
    </div>
  );
}
