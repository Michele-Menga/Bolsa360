import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, BookMarked, Search, SlidersHorizontal } from "lucide-react";
import { OrbitLogo, BookLogo } from "@/components/brand/Bolsa360Logos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErroCaixa, Skeleton } from "@/components/ui/misc";
import { OportunidadeCard } from "@/components/OportunidadeCard";
import { useOportunidades, useReferencias } from "@/lib/queries";
import { useAuth } from "@/auth/AuthContext";

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const eCandidato = user?.papel === "CANDIDATO";
  const [q, setQ] = useState("");
  const abertas = useOportunidades({ estadoPrazo: "ABERTO", limite: "3", ordenar: "prazo" });
  const total = useOportunidades({ limite: "1" });
  const elegiveis = useOportunidades({ limite: "1", elegibilidadeAngolanos: "ELEGIVEL" });
  const ref = useReferencias();

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_.8fr] md:py-24">
          <div className="animate-rise">
            <p className="mb-4 text-xs font-light tracking-[.25em] text-brand">O TEU FUTURO. 360° DE OPORTUNIDADES.</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Descobre bolsas de estudo para <span className="text-brand">alcançares mais.</span></h1>
            <p className="mt-4 max-w-xl text-white/75">Um só lugar com bolsas e formações para candidatos angolanos: filtra, guarda as favoritas e acompanha cada candidatura até ao fim.</p>
            <form className="mt-8 flex max-w-xl gap-2 rounded-full bg-white p-1.5" onSubmit={(e) => { e.preventDefault(); nav(`/oportunidades${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}>
              <label htmlFor="busca" className="sr-only">Pesquisar bolsas</label>
              <Search className="ml-4 h-5 w-5 shrink-0 self-center text-mute" />
              <Input id="busca" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar bolsas, cursos ou instituições" className="border-0 bg-transparent px-2 text-ink focus:border-0" />
              <Button type="submit">Pesquisar</Button>
            </form>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[["Oportunidades", total.data?.meta.total], ["Elegíveis p/ angolanos", elegiveis.data?.meta.total], ["Abertas agora", abertas.data?.meta.total]].map(([l, v]) => (
                <div key={String(l)}><dd className="text-3xl font-bold text-brand">{v ?? "–"}</dd><dt className="text-xs text-white/70">{l}</dt></div>
              ))}
            </dl>
          </div>
          <div className="hidden justify-self-center md:block">
            {eCandidato ? (
              <BookLogo size={340} theme="dark" title="Símbolo Bolsa360 — Livro de Oportunidades" />
            ) : (
              <OrbitLogo size={340} theme="dark" mode="draw" title="Símbolo Bolsa360" />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between"><h2 className="text-2xl font-bold">A fechar em breve</h2>
          <Link to="/oportunidades?estadoPrazo=ABERTO" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">Ver todas <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid gap-4 md:grid-cols-3">
          {abertas.isLoading ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-52" />)
            : abertas.error ? <div className="md:col-span-3"><ErroCaixa erro={abertas.error} /></div>
            : abertas.data?.data.length ? abertas.data.data.map((o) => <OportunidadeCard key={o.id} o={o} />)
            : <p className="text-mute md:col-span-3">Sem oportunidades abertas neste momento.</p>}
        </div>
      </section>

      {!!ref.data?.tipos.length && <section className="bg-brand-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="mb-6 text-2xl font-bold">Explora por tipo</h2>
          <div className="flex flex-wrap gap-2">{ref.data.tipos.map(({ codigo: cod, nome }) => (
            <Link key={cod} to={`/oportunidades?tipo=${cod}`} className="rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-white">{nome}</Link>))}</div>
        </div>
      </section>}

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3">
        {[[SlidersHorizontal, "Filtra com precisão", "Por nível, país, tipo de financiamento, prazo e elegibilidade para angolanos."],
          [BadgeCheck, "Informação verificada", "Cada oportunidade aponta para a fonte oficial e mostra a última verificação."],
          [BookMarked, "Acompanha tudo", "Guarda favoritas, planeia candidaturas, regista notas e vê o histórico de estados."]].map(([Icon, t, d]: any) => (
          <div key={t} className="rounded-2xl border border-line p-6"><Icon className="mb-3 h-7 w-7 text-brand-dark" /><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-mute">{d}</p></div>))}
      </section>
    </>
  );
}
