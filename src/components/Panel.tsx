import type { PropsWithChildren } from "react";

interface PanelProps extends PropsWithChildren {
  className?: string;
}

export const Panel = ({ children, className = "" }: PanelProps) => (
  <section className={`border border-white/10 bg-panel/92 shadow-soft backdrop-blur-xl ${className}`}>
    {children}
  </section>
);
