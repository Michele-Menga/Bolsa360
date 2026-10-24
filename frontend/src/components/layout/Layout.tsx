import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { BMark } from "@/components/brand/Bolsa360Logos";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";

function Marca({ claro = false }: { claro?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <Link to="/" aria-label="Bolsa360 — página inicial" className="flex items-center gap-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <BMark key={String(hover)} size={38} theme={claro ? "dark" : "light"} mode={hover ? "morph" : "static"} loop={false} title="" />
      <span className={cn("text-xl font-bold tracking-wide", claro ? "text-white" : "text-ink")}>BOLSA<span className="text-brand">360</span></span>
    </Link>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [aberto, setAberto] = useState(false);
  const link = ({ isActive }: { isActive: boolean }) => cn("rounded-full px-4 py-2 text-sm font-medium transition-colors", isActive ? "bg-ink text-white" : "hover:bg-line/70");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Marca />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            <NavLink to="/oportunidades" className={link}>Oportunidades</NavLink>
            {user?.papel === "CANDIDATO" && <NavLink to="/painel" className={link}>O meu painel</NavLink>}
            {user?.papel === "ADMIN" && <NavLink to="/admin" className={link}>Administração</NavLink>}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="flex items-center gap-2 text-sm text-mute">
                  {user.papel === "ADMIN" ? <ShieldCheck className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}{user.nome.split(" ")[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={async () => { await logout(); nav("/"); }}><LogOut className="h-4 w-4" />Sair</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => nav("/entrar", { state: { de: loc.pathname + loc.search } })}>Entrar</Button>
                <Button size="sm" onClick={() => nav("/registar", { state: { de: loc.pathname + loc.search } })}>Criar conta</Button>
              </>
            )}
          </div>
          <button className="md:hidden rounded-full p-2 hover:bg-line/70" aria-label="Menu" aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
            {aberto ? <X /> : <Menu />}
          </button>
        </div>
        {aberto && (
          <div className="border-t border-line bg-white px-4 py-3 md:hidden animate-fade" onClick={() => setAberto(false)}>
            <div className="flex flex-col gap-1">
              <NavLink to="/oportunidades" className={link}>Oportunidades</NavLink>
              {user?.papel === "CANDIDATO" && <NavLink to="/painel" className={link}>O meu painel</NavLink>}
              {user?.papel === "ADMIN" && <NavLink to="/admin" className={link}>Administração</NavLink>}
              {user ? <button className="rounded-full px-4 py-2 text-left text-sm font-medium hover:bg-line/70" onClick={async () => { await logout(); nav("/"); }}>Sair</button> : (
                <><NavLink to="/entrar" className={link}>Entrar</NavLink><NavLink to="/registar" className={link}>Criar conta</NavLink></>
              )}
            </div>
          </div>
        )}
      </header>
      {user?.papel === "MENTOR" && (
        <div role="status" className="bg-brand-soft px-4 py-2 text-center text-xs font-medium">
          A área de mentores ainda não está disponível. Entretanto, podes consultar o catálogo de oportunidades.
        </div>
      )}
      <main className="flex-1"><div key={loc.pathname} className="animate-rise"><Outlet /></div></main>
      <footer className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <Marca claro />
          <p className="text-xs font-light tracking-[.18em] text-white/70">O TEU FUTURO. 360° DE OPORTUNIDADES.</p>
          <p className="text-xs text-white/50">Projeto académico · Informação sujeita a confirmação na fonte oficial.</p>
        </div>
      </footer>
    </div>
  );
}
