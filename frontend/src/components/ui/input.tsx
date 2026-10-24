import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base = "w-full rounded-xl border-2 border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-mute/70 transition-colors focus:border-brand focus:outline-none disabled:bg-line/40";

export function Field({ label, erro, dica, children }: { label: string; erro?: string; dica?: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children(id)}
      {dica && !erro && <p className="text-xs text-mute">{dica}</p>}
      {erro && <p role="alert" className="text-xs font-medium text-red-600">{erro}</p>}
    </div>
  );
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, r) => <input ref={r} className={cn(base, className)} {...p} />);
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...p }, r) => <select ref={r} className={cn(base, "pr-8", className)} {...p} />);
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, r) => <textarea ref={r} className={cn(base, "min-h-24", className)} {...p} />);
Input.displayName = "Input"; Select.displayName = "Select"; Textarea.displayName = "Textarea";
