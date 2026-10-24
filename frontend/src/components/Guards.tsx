import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { paginaInicial } from "@/auth/destino";
import type { Papel } from "@/lib/types";

export function RequireAuth({ papel }: { papel?: Papel }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/entrar" replace state={{ de: loc.pathname + loc.search }} />;
  // Papel errado: vai para a página do próprio papel (ADMIN→/admin, CANDIDATO→/painel, MENTOR→/).
  // Essas páginas aceitam sempre esse papel, por isso não há ciclos de redirecionamento.
  if (papel && user.papel !== papel) return <Navigate to={paginaInicial(user.papel)} replace />;
  return <Outlet />;
}
