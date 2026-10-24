import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[.97]",
  {
    variants: {
      variant: {
        primary: "bg-brand text-ink hover:bg-brand-dark shadow-sm",
        dark: "bg-ink text-white hover:bg-ink/85",
        outline: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
        ghost: "text-ink hover:bg-line/70",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-13 px-8 text-base py-3.5" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants> & { loading?: boolean };
export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant, size, loading, children, disabled, ...p }, ref) => (
  <button ref={ref} className={cn(variants({ variant, size }), className)} disabled={disabled || loading} {...p}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{children}
  </button>
));
Button.displayName = "Button";
