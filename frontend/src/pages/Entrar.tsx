import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { OrbitLogo } from "@/components/brand/Bolsa360Logos";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ErroCaixa } from "@/components/ui/misc";
import { BootScreen } from "@/components/LoadingScreens";
import { paraLista, TipoContaSelector, type TipoConta } from "@/components/TipoContaSelector";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/lib/api";

const DEMO = ["admin@example.org", "ana.demo@example.org", "daniel.demo@example.org", "filipe.demo@example.org"];
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Entrar({ modo }: { modo: "login" | "registo" }) {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const de = (loc.state as { de?: string } | null)?.de;
  const registo = modo === "registo";
  const [v, setV] = useState({ nome: "", email: "", palavraPasse: "" });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<unknown>(null);
  const [a, setA] = useState(false);
  const [tipo, setTipo] = useState<TipoConta>("CANDIDATO");
  const [mentor, setMentor] = useState({ biografia: "", especialidades: "" });
  const destino = (papel: string) => de ?? (papel === "ADMIN" ? "/admin" : papel === "MENTOR" ? "/mentor" : "/painel");

  if (user && !a) return <Navigate to={destino(user.papel)} replace />;

  async function submeter(e: FormEvent) {
    e.preventDefault(); setErro(null);
    // validação alinhada com autenticacao.schema.ts (nome 2–120, email, palavra-passe ≥ 8)
    const er: Record<string, string> = {};
    if (registo && v.nome.trim().length < 2) er.nome = "Indica o teu nome (mínimo 2 letras).";
    if (!/^\S+@\S+\.\S+$/.test(v.email)) er.email = "Email inválido.";
    if (registo ? v.palavraPasse.length < 8 : !v.palavraPasse) er.palavraPasse = registo ? "Mínimo de 8 caracteres." : "Indica a palavra-passe.";
    setErros(er); if (Object.keys(er).length) return;

    setA(true);
    try {
      const [u] = await Promise.all([registo
        ? register(v.nome.trim(), v.email.trim(), v.palavraPasse, tipo === "MENTOR"
          ? { papel: "MENTOR", biografia: mentor.biografia.trim() || undefined, especialidades: paraLista(mentor.especialidades) }
          : { papel: "CANDIDATO" })
        : login(v.email.trim(), v.palavraPasse), espera(1600)]);
      nav(destino(u.papel), { replace: true });
    } catch (e) {
      setA(false);
      setErro(e instanceof ApiError && e.codigo === "DEMASIADAS_TENTATIVAS" ? new Error("Demasiadas tentativas falhadas. Aguarda uns minutos e tenta de novo.") : e);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 md:grid-cols-2">
      {a && <BootScreen label={registo ? "A criar a tua conta…" : "A entrar…"} />}
      <div className="hidden text-center md:block"><OrbitLogo size={260} mode="draw" title="" />
        <p className="mt-6 text-2xl font-bold">BOLSA<span className="text-brand">360</span></p><p className="mt-2 text-xs font-light tracking-[.2em]">O TEU FUTURO. 360° DE OPORTUNIDADES.</p></div>
      <form onSubmit={submeter} noValidate className="space-y-4 rounded-2xl border border-line p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{registo ? "Cria a tua conta" : "Bem-vindo de volta"}</h1>
        {erro != null && <ErroCaixa erro={erro} />}
        {registo && <TipoContaSelector valor={tipo} onChange={setTipo} mentor={mentor} onMentor={setMentor} />}
        {registo && <Field label="Nome" erro={erros.nome}>{(id) => <Input id={id} autoComplete="name" value={v.nome} onChange={(e) => setV({ ...v, nome: e.target.value })} />}</Field>}
        <Field label="Email" erro={erros.email}>{(id) => <Input id={id} type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />}</Field>
        <Field label="Palavra-passe" erro={erros.palavraPasse} dica={registo ? "Mínimo de 8 caracteres." : undefined}>
          {(id) => <Input id={id} type="password" autoComplete={registo ? "new-password" : "current-password"} value={v.palavraPasse} onChange={(e) => setV({ ...v, palavraPasse: e.target.value })} />}</Field>
        <Button type="submit" size="lg" className="w-full">{registo ? (tipo === "MENTOR" ? "Criar conta de mentor" : "Criar conta de estudante") : "Entrar"}</Button>
        <p className="text-center text-sm text-mute">{registo ? "Já tens conta?" : "Ainda não tens conta?"}{" "}
          <Link to={registo ? "/entrar" : "/registar"} state={{ de }} className="font-semibold text-ink underline decoration-brand decoration-2">{registo ? "Entrar" : "Criar conta"}</Link></p>
        {(import.meta.env.DEV || import.meta.env.VITE_PREVIEW) && !registo && (
          <div className="rounded-xl bg-line/40 p-3 text-xs text-mute">{import.meta.env.VITE_PREVIEW ? "Pré-visualização: usa qualquer palavra-passe." : "Contas do seed (a palavra-passe está no teu .env):"}
            <div className="mt-2 flex flex-wrap gap-1.5">{DEMO.map((m) => <button type="button" key={m} onClick={() => setV({ ...v, email: m })} className="rounded-full border border-line bg-white px-2.5 py-1 hover:border-ink">{m}</button>)}</div></div>)}
      </form>
    </div>
  );
}
