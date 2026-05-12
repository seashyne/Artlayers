import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

export const IconButton = ({ icon: Icon, label, active = false, className = "", ...props }: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`grid h-10 w-10 place-items-center rounded-md border transition ${
      active
        ? "border-sky-300/70 bg-sky-300/18 text-sky-200"
        : "border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/8"
    } ${className}`}
    {...props}
  >
    <Icon size={18} strokeWidth={2} />
  </button>
);
