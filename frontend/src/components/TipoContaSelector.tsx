import { GraduationCap, Presentation } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TipoConta = "CANDIDATO" | "MENTOR";
export type DadosMentorRegisto = { biografia: string; especialidades: string };

const OPCOES = [
  { id: "CANDIDATO", titulo: "Sou estudante", texto: "Quero descobrir bolsas e acompanhar candidaturas.", Icon: GraduationCap },
  { id: "MENTOR", titulo: "Sou mentor", texto: "Quero orientar estudantes e oferecer sessões.", Icon: Presentation },
] as const;

/** Pergunta, no registo, se a conta é de estudante ou de mentor. */
export function TipoContaSelector({ valor, onChange, mentor, onMentor, erros }: {
  valor: TipoConta; onChange: (t: TipoConta) => void;
  mentor: DadosMentorRegisto; onMentor: (d: DadosMentorRegisto) => void; erros?: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Que tipo de conta queres criar?</legend>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
          {OPCOES.map(({ id, titulo, texto, Icon }) => (
            <button key={id} type="button" role="radio" aria-checked={valor === id} onClick={() => onChange(id)}
              className={cn("rounded-2xl border-2 p-4 text-left transition", valor === id ? "border-ink bg-brand-soft shadow-sm" : "border-line hover:border-ink/50")}>
              <span className={cn("mb-2 grid h-10 w-10 place-items-center rounded-full", valor === id ? "bg-brand" : "bg-line")}><Icon className="h-5 w-5" /></span>
              <span className="block font-semibold">{titulo}</span><span className="block text-xs text-mute">{texto}</span>
            </button>))}
        </div>
      </fieldset>
      {valor === "MENTOR" && (
        <div className="space-y-4 rounded-2xl bg-line/40 p-4 animate-fade">
          <p className="text-xs text-mute">As contas de mentor são verificadas pela equipa antes de os teus serviços ficarem visíveis. Podes completar o perfil depois.</p>
          <Field label="Biografia" erro={erros?.biografia} dica="Conta em poucas linhas a tua experiência (mínimo recomendado: 20 caracteres).">
            {(id) => <Textarea id={id} maxLength={2000} value={mentor.biografia} onChange={(e) => onMentor({ ...mentor, biografia: e.target.value })} />}</Field>
          <Field label="Áreas de especialidade" erro={erros?.especialidades} dica="Separa por vírgulas. Ex.: Bolsas na China, Cartas de motivação">
            {(id) => <Input id={id} value={mentor.especialidades} onChange={(e) => onMentor({ ...mentor, especialidades: e.target.value })} />}</Field>
        </div>)}
    </div>
  );
}
export const paraLista = (s: string) => s.split(",").map((x) => x.trim()).filter((x) => x.length >= 2).slice(0, 10);
