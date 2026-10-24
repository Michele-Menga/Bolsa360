import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { RequireAuth } from "@/components/Guards";
import { BootScreen, PageLoader } from "@/components/LoadingScreens";

const Home = lazy(() => import("@/pages/Home"));
const Catalogo = lazy(() => import("@/pages/Catalogo"));
const Detalhe = lazy(() => import("@/pages/Detalhe"));
const Entrar = lazy(() => import("@/pages/Entrar"));
const Painel = lazy(() => import("@/pages/Painel"));
const Admin = lazy(() => import("@/pages/Admin"));
const NaoEncontrada = lazy(() => import("@/pages/NaoEncontrada"));

export default function App() {
  const { booting } = useAuth();
  // O ecrã inicial fica visível pelo menos 1,6 s, para a animação de marca ser percebida.
  const [minimo, setMinimo] = useState(true);
  useEffect(() => { const t = setTimeout(() => setMinimo(false), 1600); return () => clearTimeout(t); }, []);
  if (booting || minimo) return <BootScreen />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="oportunidades" element={<Catalogo />} />
          <Route path="oportunidades/:id" element={<Detalhe />} />
          <Route path="entrar" element={<Entrar modo="login" />} />
          <Route path="registar" element={<Entrar modo="registo" />} />
          <Route element={<RequireAuth papel="CANDIDATO" />}><Route path="painel" element={<Painel />} /></Route>
          <Route element={<RequireAuth papel="ADMIN" />}><Route path="admin" element={<Admin />} /></Route>
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
