import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, definirAoPerderSessao } from "@/lib/api";
import type { Utilizador } from "@/lib/types";

export type RegistoExtra = { papel?: "CANDIDATO" | "MENTOR"; biografia?: string; especialidades?: string[] };

type Ctx = {
  user: Utilizador | null;
  booting: boolean;
  login: (email: string, palavraPasse: string) => Promise<Utilizador>;
  register: (nome: string, email: string, palavraPasse: string, extra?: RegistoExtra) => Promise<Utilizador>;
  logout: () => Promise<void>;
};
const AuthCtx = createContext<Ctx | null>(null);
export const useAuth = () => { const c = useContext(AuthCtx); if (!c) throw new Error("useAuth fora do AuthProvider"); return c; };

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<Utilizador | null>(null);
  const [booting, setBooting] = useState(true);
  const temSessao = useRef(false);
  temSessao.current = user !== null;

  // Sessão expirada/revogada a meio da navegação: o backend responde 401 a uma rota protegida.
  // Limpa o estado local; as rotas protegidas passam a redirecionar para /entrar.
  useEffect(() => {
    definirAoPerderSessao(() => { if (temSessao.current) { qc.clear(); setUser(null); } });
    return () => definirAoPerderSessao(null);
  }, [qc]);

  // Restaura a sessão a partir do cookie. 401 = sem sessão (normal para visitantes).
  useEffect(() => {
    let vivo = true;
    api.get<{ data: Utilizador }>("/auth/me")
      .then((r) => vivo && setUser(r.data))
      .catch((e) => { if (!(e instanceof ApiError) || (e.status !== 401 && e.status !== 403)) console.warn(e); })
      .finally(() => vivo && setBooting(false));
    return () => { vivo = false; };
  }, []);

  const login = useCallback(async (email: string, palavraPasse: string) => {
    const r = await api.post<{ data: Utilizador }>("/auth/login", { email, palavraPasse });
    qc.clear(); setUser(r.data); return r.data;
  }, [qc]);
  const register = useCallback(async (nome: string, email: string, palavraPasse: string, extra: RegistoExtra = {}) => {
    const r = await api.post<{ data: Utilizador }>("/auth/register", { nome, email, palavraPasse, ...extra });
    qc.clear(); setUser(r.data); return r.data;
  }, [qc]);
  const logout = useCallback(async () => { try { await api.post("/auth/logout"); } finally { qc.clear(); setUser(null); } }, [qc]);

  const value = useMemo(() => ({ user, booting, login, register, logout }), [user, booting, login, register, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}