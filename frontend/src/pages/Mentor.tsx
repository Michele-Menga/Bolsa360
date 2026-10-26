import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, BadgeCheck, CalendarDays, Check, ExternalLink, Hourglass, Plus, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Badge, Card, ErroCaixa, Skeleton, Vazio } from "@/components/ui/misc";
import { PageLoader, ProcessingOverlay } from "@/components/LoadingScreens";
import { paraLista } from "@/components/TipoContaSelector";
import { useAuth } from "@/auth/AuthContext";
import { MOEDAS, SESSAO, VERIFICACAO, useAgenda, useMentorAcoes, useMentorMe, useServicos, type EstadoAgendamento, type Servico, type Sessao } from "@/lib/mentor";
import { cn } from "@/lib/utils";

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const quando = (iso: string) => new Date(iso).toLocaleString("pt-AO", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const TOM: Record<EstadoAgendamento, "ok" | "warn" | "off" | "brand"> = { PENDENTE_PAGAMENTO: "warn", CONFIRMADO: "ok", CONCLUIDO: "brand", CANCELADO: "off" };

/* ---------- Agenda ---------- */
function SessaoCard({ s, executar }: { s: Sessao; executar: (rotulo: string, fn: () => Promise<unknown>) => Promise<boolean> }) {
  const { aceitar, recusar, concluir, cancelar } = useMentorAcoes();
  const [aCancelar, setACancelar] = useState(false);
  const [aRecusar, setARecusar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [nota, setNota] = useState<string | null>(null);

  const eSolicitacao = s.estado === "PENDENTE_PAGAMENTO";
  const podeConcluir = s.estado === "CONFIRMADO" && new Date(s.inicio) <= new Date();
  const podeCancelar = s.estado === "CONFIRMADO";

  return (
    <Card className={cn("space-y-3 transition", eSolicitacao && "border-2 border-brand bg-brand-soft/20")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{s.servico.titulo}</p>
            {eSolicitacao && <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-ink">Nova Solicitação</span>}
          </div>
          <p className="text-sm text-mute">Estudante: <b>{s.candidato.nome}</b> · {quando(s.inicio)}{s.servico.duracaoMinutos ? ` · ${s.servico.duracaoMinutos} min` : ""}</p>
        </div>
        <Badge tom={TOM[s.estado]}>{SESSAO[s.estado]}</Badge>
      </div>

      {eSolicitacao && !aRecusar && (
        <div className="rounded-xl border border-brand/40 bg-white p-3 text-sm">
          <p className="font-medium text-ink">O estudante enviou uma solicitação para este horário.</p>
          <p className="mt-0.5 text-xs text-mute">Podes aceitar para confirmar a sessão e gerar a sala de reunião, ou recusar se não tiveres disponibilidade.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => executar("A aceitar solicitação…", () => aceitar.mutateAsync(s.id))}>
              <Check className="h-4 w-4" />Aceitar solicitação
            </Button>
            <Button size="sm" variant="outline" onClick={() => setARecusar(true)}>
              <X className="h-4 w-4" />Recusar solicitação
            </Button>
          </div>
        </div>
      )}

      {aRecusar && (
        <form className="space-y-2 rounded-xl border border-red-200 bg-red-50/50 p-3" onSubmit={async (e) => {
          e.preventDefault();
          await executar("A recusar solicitação…", () => recusar.mutateAsync({ id: s.id, motivo: motivoRecusa.trim() }));
          setARecusar(false);
        }}>
          <Field label="Motivo da recusa (opcional)" dica="O estudante poderá ver este motivo no painel.">
            {(id) => <Input id={id} maxLength={300} placeholder="Ex.: Indisponibilidade de agenda neste horário" value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)} />}
          </Field>
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="danger">Confirmar recusa</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setARecusar(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {s.estado === "CONFIRMADO" && (s.linkReuniao
        ? <a href={s.linkReuniao} target="_blank" rel="noreferrer"><Button size="sm"><Video className="h-4 w-4" />Entrar na reunião<ExternalLink className="h-3.5 w-3.5" /></Button></a>
        : <p className="flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-2 text-sm"><Hourglass className="h-4 w-4" />O link da reunião ainda está a ser gerado. Volta a verificar daqui a pouco.</p>)}

      {s.motivoCancelamento && <p className="text-sm text-red-600">Motivo: {s.motivoCancelamento}</p>}
      {nota && <p role="status" className="rounded-xl bg-brand-soft px-3 py-2 text-sm">{nota}</p>}

      {(podeConcluir || podeCancelar) && !aCancelar && (
        <div className="flex flex-wrap gap-2">
          {podeConcluir && <Button size="sm" variant="dark" onClick={() => executar("A concluir sessão…", () => concluir.mutateAsync(s.id))}><Check className="h-4 w-4" />Marcar como concluída</Button>}
          {podeCancelar && <Button size="sm" variant="outline" onClick={() => setACancelar(true)}>Cancelar sessão</Button>}
        </div>)}

      {aCancelar && (
        <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); await executar("A cancelar sessão…", async () => {
          const r = await cancelar.mutateAsync({ id: s.id, motivo: motivo.trim() });
          if (r.data.reembolsoManual) setNota("Sessão cancelada. Como já estava paga, o reembolso é feito manualmente pela equipa.");
        }); setACancelar(false); }}>
          <Field label="Motivo do cancelamento" dica="O estudante vê este motivo.">{(id) => <Textarea id={id} required minLength={3} maxLength={500} value={motivo} onChange={(e) => setMotivo(e.target.value)} />}</Field>
          <div className="flex gap-2"><Button type="submit" size="sm" variant="danger">Confirmar cancelamento</Button><Button type="button" size="sm" variant="ghost" onClick={() => setACancelar(false)}>Voltar</Button></div>
        </form>)}
    </Card>
  );
}

function Agenda({ executar }: { executar: (r: string, fn: () => Promise<unknown>) => Promise<boolean> }) {
  const [estado, setEstado] = useState("");
  const { data, isLoading, error } = useAgenda(estado || undefined);
  return (
    <div className="space-y-4">
      <Select aria-label="Filtrar por estado" className="max-w-xs" value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="">Todas as sessões</option>{Object.entries(SESSAO).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</Select>
      {error ? <ErroCaixa erro={error} /> : isLoading ? <Skeleton className="h-28" />
        : !data?.length ? <Vazio titulo="Ainda não tens sessões" texto="Quando um estudante agendar um dos teus serviços, a sessão aparece aqui." />
        : <div className="space-y-3">{data.map((s) => <SessaoCard key={s.id} s={s} executar={executar} />)}</div>}
    </div>
  );
}

/* ---------- Serviços ---------- */
const VAZIO = { titulo: "", descricao: "", duracaoMinutos: "45", preco: "", moeda: "AOA" };

function ServicoForm({ inicial, onFechar, executar, id }: { inicial: typeof VAZIO; id?: string; onFechar: () => void; executar: (r: string, fn: () => Promise<unknown>) => Promise<boolean> }) {
  const { criarServico, atualizarServico } = useMentorAcoes();
  const [f, setF] = useState(inicial);
  const set = (k: keyof typeof VAZIO) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });
  async function submeter(e: FormEvent) {
    e.preventDefault();
    const corpo = { titulo: f.titulo.trim(), descricao: f.descricao.trim(), duracaoMinutos: Number(f.duracaoMinutos), preco: f.preco.trim(), moeda: f.moeda };
    const ok = await executar(id ? "A guardar serviço…" : "A criar serviço…", () => (id ? atualizarServico.mutateAsync({ id, ...corpo }) : criarServico.mutateAsync(corpo)));
    if (ok) onFechar();
  }
  const erro = (id ? atualizarServico : criarServico).error;
  return (
    <form onSubmit={submeter} className="space-y-4 rounded-2xl border-2 border-ink p-5 animate-fade">
      <h3 className="font-semibold">{id ? "Editar serviço" : "Novo serviço de mentoria"}</h3>
      {erro && <ErroCaixa erro={erro} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título *">{(i) => <Input id={i} required minLength={3} maxLength={200} value={f.titulo} onChange={set("titulo")} placeholder="Ex.: Revisão da carta de motivação" />}</Field>
        <Field label="Duração (minutos) *">{(i) => <Input id={i} type="number" required min={15} max={240} step={5} value={f.duracaoMinutos} onChange={set("duracaoMinutos")} />}</Field>
        <Field label="Preço *" dica="Ex.: 15000 ou 25.50">{(i) => <Input id={i} required inputMode="decimal" pattern="\d{1,12}(\.\d{1,2})?" value={f.preco} onChange={set("preco")} />}</Field>
        <Field label="Moeda *">{(i) => <Select id={i} value={f.moeda} onChange={set("moeda")}>{MOEDAS.map((m) => <option key={m}>{m}</option>)}</Select>}</Field>
      </div>
      <Field label="Descrição *" dica="O que o estudante vai receber nesta sessão (mínimo 10 caracteres).">{(i) => <Textarea id={i} required minLength={10} maxLength={2000} value={f.descricao} onChange={set("descricao")} />}</Field>
      <div className="flex gap-2"><Button type="submit">{id ? "Guardar" : "Criar serviço"}</Button><Button type="button" variant="ghost" onClick={onFechar}>Cancelar</Button></div>
    </form>
  );
}

function Servicos({ executar }: { executar: (r: string, fn: () => Promise<unknown>) => Promise<boolean> }) {
  const { data, isLoading, error } = useServicos();
  const { atualizarServico } = useMentorAcoes();
  const [form, setForm] = useState<{ id?: string; inicial: typeof VAZIO } | null>(null);
  const editar = (s: Servico) => setForm({ id: s.id, inicial: { titulo: s.titulo, descricao: s.descricao, duracaoMinutos: String(s.duracaoMinutos ?? 45), preco: s.preco.replace(/\.00$/, ""), moeda: s.moeda } });
  return (
    <div className="space-y-4">
      {!form && <Button onClick={() => setForm({ inicial: VAZIO })}><Plus className="h-4 w-4" />Novo serviço</Button>}
      {form && <ServicoForm key={form.id ?? "novo"} {...form} onFechar={() => setForm(null)} executar={executar} />}
      {error ? <ErroCaixa erro={error} /> : isLoading ? <Skeleton className="h-24" /> : !data?.length && !form ? <Vazio titulo="Ainda não ofereces nenhum serviço" texto="Cria o teu primeiro serviço para os estudantes o poderem agendar." /> : (
        <div className="space-y-3">{data?.map((s) => (
          <Card key={s.id} className={cn("flex flex-wrap items-center gap-4", !s.ativo && "opacity-70")}>
            <div className="min-w-0 flex-1"><p className="font-semibold">{s.titulo}</p>
              <p className="text-sm text-mute">{s.duracaoMinutos} min · {Number(s.preco).toLocaleString("pt-AO")} {s.moeda}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink/80">{s.descricao}</p></div>
            <div className="flex items-center gap-2">
              {s.visivelParaCandidatos ? <Badge tom="ok">Visível</Badge> : <Badge tom="off">{s.ativo ? "Oculto até verificação" : "Desativado"}</Badge>}
              <Button size="sm" variant="ghost" onClick={() => editar(s)}>Editar</Button>
              <Button size="sm" variant="outline" onClick={() => executar(s.ativo ? "A desativar serviço…" : "A ativar serviço…", () => atualizarServico.mutateAsync({ id: s.id, ativo: !s.ativo }))}>{s.ativo ? "Desativar" : "Ativar"}</Button>
            </div></Card>))}</div>)}
    </div>
  );
}

/* ---------- Perfil ---------- */
function PerfilMentor() {
  const { data: m, isLoading, error } = useMentorMe();
  const { guardarPerfil } = useMentorAcoes();
  const [bio, setBio] = useState(""); const [esp, setEsp] = useState(""); const [ok, setOk] = useState(false);
  useEffect(() => { if (m) { setBio(m.biografia); setEsp(m.especialidades.join(", ")); } }, [m]);
  if (isLoading) return <PageLoader label="A carregar perfil…" />;
  if (error) return <ErroCaixa erro={error} />;
  return (
    <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setOk(false); await guardarPerfil.mutateAsync({ biografia: bio.trim(), especialidades: paraLista(esp) }); setOk(true); }}>
      {guardarPerfil.error && <ErroCaixa erro={guardarPerfil.error} />}
      <Field label="Biografia" dica="Aparece aos estudantes. Mínimo recomendado: 20 caracteres.">{(id) => <Textarea id={id} className="min-h-36" maxLength={2000} value={bio} onChange={(e) => setBio(e.target.value)} />}</Field>
      <Field label="Áreas de especialidade" dica="Separa por vírgulas (máx. 10).">{(id) => <Input id={id} value={esp} onChange={(e) => setEsp(e.target.value)} />}</Field>
      <div className="flex flex-wrap gap-2">{paraLista(esp).map((x) => <Badge key={x} tom="warn">{x}</Badge>)}</div>
      <Button type="submit" loading={guardarPerfil.isPending}>{ok ? <><Check className="h-4 w-4" />Perfil guardado</> : "Guardar perfil"}</Button>
    </form>
  );
}

/* ---------- Página ---------- */
const TABS = [["agenda", "Agenda"], ["servicos", "Serviços"], ["perfil", "Perfil"]] as const;

export default function Mentor() {
  const { user } = useAuth();
  const { data: m, isLoading, error } = useMentorMe();
  const todas = useAgenda();
  const servicos = useServicos();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("agenda");
  const [a, setA] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Executa uma ação com o ecrã de processamento (B → livro) e um tempo mínimo para a animação se ver.
  async function executar(rotulo: string, fn: () => Promise<unknown>) {
    setA(rotulo); setAviso(null);
    try { await Promise.all([fn(), espera(1200)]); return true; } catch (e) { setAviso((e as Error).message); return false; } finally { setA(null); }
  }
  if (isLoading) return <PageLoader label="A carregar a tua área…" />;
  if (error || !m) return <div className="mx-auto max-w-4xl px-4 py-10"><ErroCaixa erro={error ?? new Error("Não foi possível carregar o perfil de mentor.")} /></div>;

  const agora = new Date();
  const stats = [
    ["Serviços ativos", servicos.data?.filter((s) => s.ativo).length],
    ["Solicitações pendentes", todas.data?.filter((s) => s.estado === "PENDENTE_PAGAMENTO").length],
    ["Sessões confirmadas", todas.data?.filter((s) => s.estado === "CONFIRMADO" && new Date(s.fim) >= agora).length],
    ["Concluídas", todas.data?.filter((s) => s.estado === "CONCLUIDO").length],
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <ProcessingOverlay open={!!a} label={a ?? ""} />
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Olá, {user?.nome.split(" ")[0]} <span className="text-brand">👋</span></h1>
        <Badge tom={m.estadoVerificacao === "VERIFICADA" ? "ok" : m.estadoVerificacao === "REJEITADA" ? "off" : "warn"}>
          {m.estadoVerificacao === "VERIFICADA" && <BadgeCheck className="h-3.5 w-3.5" />}{VERIFICACAO[m.estadoVerificacao]}</Badge>
      </div>
      <p className="mb-6 text-mute">Gere os teus serviços, a tua agenda e o teu perfil de mentor.</p>

      {m.estadoVerificacao !== "VERIFICADA" && (
        <div role="status" className="mb-6 flex gap-3 rounded-2xl bg-brand-soft p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{m.estadoVerificacao === "PENDENTE" ? "A tua conta está em verificação pela equipa. Podes preparar o perfil e os serviços, mas só ficam visíveis e agendáveis por estudantes depois de verificada."
            : "A tua verificação foi rejeitada, por isso os teus serviços não estão visíveis. Atualiza o teu perfil e contacta a equipa."}</p></div>)}
      {m.estadoVerificacao !== "REJEITADA" && !m.perfilCompleto && (
        <button onClick={() => setTab("perfil")} className="mb-6 block w-full rounded-2xl border-2 border-dashed border-ink/30 p-3 text-left text-sm hover:border-ink">
          <b>Completa o teu perfil:</b> adiciona uma biografia e pelo menos uma especialidade para inspirares confiança aos estudantes.</button>)}

      <dl className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([l, v]) => <Card key={l} className="p-4"><dd className="text-2xl font-bold">{v ?? "–"}</dd><dt className="text-xs text-mute">{l}</dt></Card>)}</dl>

      {aviso && <div className="mb-4"><ErroCaixa erro={new Error(aviso)} /></div>}
      <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cn("flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition", tab === k ? "bg-ink text-white" : "bg-line/60 hover:bg-line")}>
            {k === "agenda" && <CalendarDays className="h-4 w-4" />}{l}</button>))}
      </div>
      <div role="tabpanel" key={tab} className="animate-fade">{tab === "agenda" ? <Agenda executar={executar} /> : tab === "servicos" ? <Servicos executar={executar} /> : <PerfilMentor />}</div>
    </div>
  );
}
