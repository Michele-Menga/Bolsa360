import { useState } from "react";
import { BadgeCheck, ShieldX, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge, Card, ErroCaixa, Skeleton, Vazio } from "@/components/ui/misc";
import { ProcessingOverlay } from "@/components/LoadingScreens";
import { VERIFICACAO, useMentoresAdmin, useVerificarMentor, type EstadoVerificacao } from "@/lib/mentor";

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const TOM = { PENDENTE: "warn", VERIFICADA: "ok", REJEITADA: "off" } as const;

/** Secção da página de administração: verificação de mentores. */
export function MentoresAdmin() {
  const [estado, setEstado] = useState("PENDENTE"); const [pagina, setPagina] = useState(1);
  const { data, isLoading, error } = useMentoresAdmin(estado, pagina);
  const verificar = useVerificarMentor();
  const [a, setA] = useState<string | null>(null); const [erro, setErro] = useState<unknown>(null);

  async function mudar(id: string, novo: EstadoVerificacao, rotulo: string) {
    setA(rotulo); setErro(null);
    try { await Promise.all([verificar.mutateAsync({ id, estado: novo }), espera(1000)]); } catch (e) { setErro(e); } finally { setA(null); }
  }
  return (
    <section className="mt-12" aria-labelledby="mentores-titulo">
      <ProcessingOverlay open={!!a} label={a ?? ""} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="mentores-titulo" className="text-2xl font-bold">Verificação de Contas de Mentores</h2>
          <p className="mt-0.5 text-xs text-mute">Validação e aprovação de perfis de mentores registados na plataforma.</p>
        </div>
        <Select aria-label="Estado de verificação" className="w-52" value={estado} onChange={(e) => { setEstado(e.target.value); setPagina(1); }}>
          <option value="">Todos</option>{Object.entries(VERIFICACAO).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</Select>
      </div>
      {erro != null && <div className="mb-3"><ErroCaixa erro={erro} /></div>}
      {error ? <ErroCaixa erro={error} /> : isLoading ? <Skeleton className="h-24" /> : !data!.data.length ? <Vazio titulo="Sem mentores neste filtro" /> : (
        <ul className="space-y-3">{data!.data.map((m) => (
          <Card key={m.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-semibold">{m.nome}</p><p className="text-sm text-mute">{m.email} · {m.totalServicos} serviço(s)</p></div>
              <Badge tom={TOM[m.estadoVerificacao]}>{VERIFICACAO[m.estadoVerificacao]}</Badge></div>
            <p className="line-clamp-3 text-sm text-ink/80">{m.biografia || <i className="text-mute">Sem biografia.</i>}</p>
            {m.especialidades.length > 0 && <div className="flex flex-wrap gap-1.5">{m.especialidades.map((x) => <Badge key={x} tom="info">{x}</Badge>)}</div>}
            <div className="flex flex-wrap gap-2 pt-1">
              {m.estadoVerificacao !== "VERIFICADA" && <Button size="sm" onClick={() => mudar(m.id, "VERIFICADA", "A verificar mentor…")}><BadgeCheck className="h-4 w-4" />Verificar</Button>}
              {m.estadoVerificacao !== "REJEITADA" && <Button size="sm" variant="outline" onClick={() => mudar(m.id, "REJEITADA", "A rejeitar mentor…")}><ShieldX className="h-4 w-4" />Rejeitar</Button>}
              {m.estadoVerificacao !== "PENDENTE" && <Button size="sm" variant="ghost" onClick={() => mudar(m.id, "PENDENTE", "A repor em verificação…")}><Undo2 className="h-4 w-4" />Repor pendente</Button>}
            </div></Card>))}</ul>)}
      {data && data.meta.totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Button size="sm" variant="outline" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</Button>
          <span className="text-mute">Página {pagina} de {data.meta.totalPaginas}</span>
          <Button size="sm" variant="outline" disabled={pagina >= data.meta.totalPaginas} onClick={() => setPagina(pagina + 1)}>Seguinte</Button></div>)}
    </section>
  );
}
