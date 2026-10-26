import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { BadgeCheck, Calendar, Clock, ExternalLink, Search, Sparkles, UserRound, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge, Card, ErroCaixa, Skeleton, Vazio } from "@/components/ui/misc";
import { ProcessingOverlay } from "@/components/LoadingScreens";
import { useAuth } from "@/auth/AuthContext";
import { useCandidatoMentoriaAcoes, useMentoresPublico, type MentorPublico, type ServicoMentoriaPublico } from "@/lib/mentor";
import { dinheiro } from "@/lib/format";

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

function AgendarModal({
  mentor,
  servico,
  onFechar,
  onSucesso,
}: {
  mentor: MentorPublico;
  servico: ServicoMentoriaPublico;
  onFechar: () => void;
  onSucesso: (linkReuniao: string | null) => void;
}) {
  const { agendar } = useCandidatoMentoriaAcoes();
  // Horário por omissão: amanhã às 14:00
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(14, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoLocal = `${amanha.getFullYear()}-${pad(amanha.getMonth() + 1)}-${pad(amanha.getDate())}T${pad(amanha.getHours())}:${pad(amanha.getMinutes())}`;

  const [dataHora, setDataHora] = useState(isoLocal);
  const [motivo, setMotivo] = useState("");
  const [a, setA] = useState(false);
  const [erro, setErro] = useState<unknown>(null);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setA(true);
    try {
      const dt = new Date(dataHora);
      const [res] = await Promise.all([
        agendar.mutateAsync({
          servicoId: servico.id,
          inicio: dt.toISOString(),
          motivo: motivo.trim() || undefined,
        }),
        espera(1300),
      ]);
      onSucesso(res.data.linkReuniao);
    } catch (err) {
      setErro(err);
    } finally {
      setA(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 p-4 animate-fade" role="dialog" aria-modal="true" aria-label="Agendar sessão de mentoria">
      <ProcessingOverlay open={a} label="A enviar a tua solicitação de mentoria…" />
      <div className="mx-auto my-8 max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-rise">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Solicitar mentoria</h2>
            <p className="text-xs text-mute">com o mentor {mentor.nome}</p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="rounded-full p-2 hover:bg-line"><X className="h-5 w-5" /></button>
        </div>

        <div className="mb-5 rounded-xl border border-line bg-brand-soft/40 p-3 text-sm">
          <p className="font-semibold text-ink">{servico.titulo}</p>
          <p className="mt-1 text-xs text-ink/80">{servico.descricao}</p>
          <div className="mt-2 flex items-center justify-between font-semibold text-ink">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-dark" />{servico.duracaoMinutos ?? 60} minutos</span>
            <span>{dinheiro(servico.preco, servico.moeda)}</span>
          </div>
        </div>

        {erro != null && <div className="mb-4"><ErroCaixa erro={erro} /></div>}

        <form onSubmit={submeter} className="space-y-4">
          <Field label="Data e hora da sessão *" dica="Escolhe um horário conveniente para a videochamada.">
            {(id) => (
              <Input
                id={id}
                type="datetime-local"
                required
                value={dataHora}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setDataHora(e.target.value)}
              />
            )}
          </Field>

          <Field label="Tópicos / Dúvidas principais" dica="Opcional. Ajuda o mentor a preparar a sessão.">
            {(id) => (
              <Input
                id={id}
                placeholder="Ex.: Revisão da carta para bolsa de mestrado em Portugal"
                maxLength={300}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            )}
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onFechar}>Cancelar</Button>
            <Button type="submit" variant="dark">Enviar solicitação</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CatalogoMentores() {
  const { user } = useAuth();
  if (user?.papel === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }
  if (user?.papel === "MENTOR") {
    return <Navigate to="/mentor" replace />;
  }

  const nav = useNavigate();
  const [pesquisa, setPesquisa] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const { data: mentores, isLoading, error } = useMentoresPublico({
    especialidade: especialidade || undefined,
    pesquisa: pesquisa.trim() || undefined,
  });

  const [sessaoAgendando, setSessaoAgendando] = useState<{ mentor: MentorPublico; servico: ServicoMentoriaPublico } | null>(null);
  const [sucessoLink, setSucessoLink] = useState<{ aberto: boolean; link: string | null }>({ aberto: false, link: null });

  function iniciarAgendamento(mentor: MentorPublico, servico: ServicoMentoriaPublico) {
    if (!user) {
      return nav("/entrar", { state: { de: "/mentores" } });
    }
    if (user.papel !== "CANDIDATO") {
      alert("Apenas contas de estudante/candidato podem agendar sessões de mentoria.");
      return;
    }
    setSessaoAgendando({ mentor, servico });
  }

  // Lista única de especialidades disponíveis
  const todasEspecialidades = Array.from(
    new Set((mentores ?? []).flatMap((m) => m.especialidades))
  ).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Modal de Agendamento */}
      {sessaoAgendando && (
        <AgendarModal
          mentor={sessaoAgendando.mentor}
          servico={sessaoAgendando.servico}
          onFechar={() => setSessaoAgendando(null)}
          onSucesso={(link) => {
            setSessaoAgendando(null);
            setSucessoLink({ aberto: true, link });
          }}
        />
      )}

      {/* Confirmação de Sucesso */}
      {sucessoLink.aberto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 animate-fade" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md space-y-4 p-6 text-center animate-rise">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/20 text-brand-dark">
              <Sparkles className="h-7 w-7" />
            </span>
            <h3 className="text-2xl font-bold">Solicitação enviada!</h3>
            <p className="text-sm text-mute">
              O teu pedido foi enviado com sucesso. O mentor irá analisar a solicitação e decidir se aceita. Podes acompanhar o estado no teu painel.
            </p>
            <div className="flex gap-2 pt-2">
              <Link to="/painel?tab=mentorias" className="flex-1">
                <Button variant="dark" className="w-full">Ver no meu painel</Button>
              </Link>
              <Button variant="ghost" onClick={() => setSucessoLink({ aberto: false, link: null })}>Fechar</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Hero */}
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-brand-dark shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Mentoria 1:1 Especializada
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Acelera o teu futuro com <span className="text-brand">mentores</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-mute sm:text-lg">
          Recebe orientação direta de profissionais e bolseiros para rever cartas de motivação, simular entrevistas e tirar dúvidas sobre candidaturas.
        </p>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-mute" />
          <Input
            aria-label="Pesquisar mentores"
            className="pl-9"
            placeholder="Pesquisar por nome de mentor ou serviço…"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        {todasEspecialidades.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setEspecialidade("")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${!especialidade ? "bg-ink text-white" : "border border-line bg-white hover:border-ink"}`}
            >
              Todas
            </button>
            {todasEspecialidades.map((esp) => (
              <button
                key={esp}
                type="button"
                onClick={() => setEspecialidade(esp === especialidade ? "" : esp)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${esp === especialidade ? "bg-ink text-white" : "border border-line bg-white hover:border-ink"}`}
              >
                {esp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {error ? (
        <ErroCaixa erro={error} />
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : !mentores?.length ? (
        <Vazio titulo="Nenhum mentor encontrado" texto="Não encontrámos mentores com os filtros selecionados." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {mentores.map((m) => (
            <Card key={m.id} className="group relative flex flex-col justify-between space-y-4 rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:border-ink hover:shadow-lg">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand-dark font-bold transition group-hover:bg-brand">
                      <UserRound className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-lg font-bold group-hover:underline decoration-brand decoration-4 underline-offset-4">{m.nome}</h2>
                        <BadgeCheck className="h-4 w-4 text-brand-dark" />
                      </div>
                      <p className="text-xs text-mute">{m.servicos.length} serviço(s) disponível(is)</p>
                    </div>
                  </div>
                  <Badge tom="ok">Verificado</Badge>
                </div>

                <p className="line-clamp-3 text-sm text-ink/80">
                  {m.biografia || <i className="text-mute">Sem biografia disponível.</i>}
                </p>

                {m.especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.especialidades.map((esp) => (
                      <Badge key={esp} tom="info">{esp}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Serviços do Mentor */}
              <div className="border-t border-line pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mute">Serviços de Mentoria</p>
                <div className="space-y-2">
                  {m.servicos.map((s) => (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-line/20 p-3 transition hover:border-ink/50">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">{s.titulo}</p>
                        <p className="line-clamp-1 text-xs text-mute">{s.descricao}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-mute">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duracaoMinutos ?? 60} min</span>
                          <span className="font-semibold text-ink">{dinheiro(s.preco, s.moeda)}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="dark" onClick={() => iniciarAgendamento(m, s)}>
                        <Calendar className="h-3.5 w-3.5" />Solicitar mentoria
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
